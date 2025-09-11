import multer from "multer";
import { z } from "zod";

import { requireEnv } from "../../lib/env";
import { requireServerEnv } from "../../server/env";
import {
  executeInsertChatMessageMutation,
  executeGetProfilesQuery,
} from "../../server/generated/serverGraphql";
import { makeApiError, makeApiSuccess } from "../../server/response";

import type { NextApiRequest, NextApiResponse } from "next";

// Use the same key as other webhooks for now
const WEBHOOK_KEY = requireServerEnv("EMAIL_REPLY_WEBHOOK_KEY");

// Configure multer for parsing multipart form data
const upload = multer({ storage: multer.memoryStorage() });

// Disable body parsing, we'll handle it with multer
export const config = {
  api: {
    bodyParser: false,
  },
};

// SendGrid Inbound Parse webhook schema for form data
const emailReplySchema = z.object({
  to: z.string(),
  from: z.string(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  envelope: z.string().optional(),
  email: z.string().optional(), // Full raw email
});

// Helper to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

/**
 * Handle email replies from SendGrid Inbound Parse
 * Email format: reply+<chatRoomId>+<messageId>@<domain>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify webhook key from query parameter
    const webhookKey = req.query.key as string;
    if (webhookKey !== WEBHOOK_KEY) {
      console.log("Invalid webhook key received:", webhookKey);
      // Return success to avoid SendGrid retries
      const response = makeApiSuccess({ detail: "Invalid key, ignoring" });
      return res.status(response.code).json(response);
    }

    // Parse multipart form data
    await runMiddleware(req, res, upload.none());

    // Validate the parsed body
    const parseResult = emailReplySchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error("Invalid email data:", parseResult.error);
      const response = makeApiSuccess({ detail: "Invalid format, ignoring" });
      return res.status(response.code).json(response);
    }

    const { to, from, text, subject, html, email } = parseResult.data;

    console.log("Received email data:", {
      to,
      from,
      subject,
      hasText: !!text,
      textLength: text?.length,
      hasHtml: !!html,
      hasEmail: !!email,
    });

    // Parse the to address to extract chat room ID and message ID
    // Expected format: reply+<chatRoomId>+<messageId>@domain.com
    const toMatch = to.match(/reply\+([^+]+)\+(\d+)@/);
    if (!toMatch) {
      console.log("Invalid reply-to address format:", to);
      // Return success to avoid SendGrid retries
      const response = makeApiSuccess({ detail: "Invalid format, ignoring" });
      return res.status(response.code).json(response);
    }

    const [, chatRoomId, replyToMessageId] = toMatch;

    // Extract sender email
    const fromMatch = from.match(/<(.+)>/) || [null, from];
    const senderEmail = fromMatch[1]?.toLowerCase().trim() || from.toLowerCase().trim();

    console.log(
      `Processing email reply from ${senderEmail} to chat ${chatRoomId}, replying to message ${replyToMessageId}`
    );

    // Find the profile by email and verify they're in the chat room
    const { data: profileData, error: profileError } =
      await executeGetProfilesQuery({
        where: {
          user: {
            email: { _eq: senderEmail },
          },
          profile_to_chat_rooms: {
            chat_room_id: { _eq: chatRoomId },
          },
        },
      });

    if (profileError || !profileData?.profile?.[0]) {
      console.log("Sender not found in chat room:", senderEmail, chatRoomId);
      // Return success to avoid SendGrid retries
      const response = makeApiSuccess({
        detail: "Sender not authorized, ignoring",
      });
      return res.status(response.code).json(response);
    }

    const senderProfile = profileData.profile[0];

    // Extract the reply text - try text first, then parse from HTML or email
    let replyText = text?.trim() || "";

    // If no plain text, try to extract from HTML
    if (!replyText && html) {
      // Basic HTML to text conversion - remove tags
      replyText = html
        .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
        .replace(/<\/p>/gi, "\n") // Add newlines after paragraphs
        .replace(/<[^>]*>/g, "") // Remove all other HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
        .replace(/&amp;/g, "&") // Decode &amp;
        .replace(/&lt;/g, "<") // Decode &lt;
        .replace(/&gt;/g, ">") // Decode &gt;
        .replace(/&quot;/g, '"') // Decode &quot;
        .replace(/&#39;/g, "'") // Decode &#39;
        .trim();
    }

    // If still no text, try to extract from raw email
    if (!replyText && email) {
      console.log("Attempting to extract text from raw email...");

      // Try multiple patterns to extract text content
      // Pattern 1: Content-Type: text/plain with various endings
      let textMatch = email.match(
        /Content-Type:\s*text\/plain[^]*?\r?\n\r?\n([^]*?)(?:\r?\n--|\r?\n\r?\n--|\nContent-Type:)/i
      );

      // Pattern 2: Look for content between boundaries
      if (!textMatch) {
        textMatch = email.match(
          /Content-Type:\s*text\/plain[^]*?\r?\n\r?\n([^]*?)(?:--[0-9a-zA-Z]+--|$)/i
        );
      }

      // Pattern 3: Simple text extraction after headers
      if (!textMatch) {
        // Find where headers end (double newline)
        const headerEndMatch = email.match(/\r?\n\r?\n/);
        if (headerEndMatch) {
          const bodyStart = headerEndMatch.index! + headerEndMatch[0].length;
          const bodyText = email.substring(bodyStart);
          // Extract until we hit a boundary or signature
          const bodyMatch = bodyText.match(
            /^([^]*?)(?:--[0-9a-zA-Z]+--|On .+ wrote:|-----Original|$)/
          );
          if (bodyMatch) {
            replyText = bodyMatch[1].trim();
          }
        }
      }

      if (textMatch && textMatch[1]) {
        replyText = textMatch[1].trim();
      }

      // Log first 500 chars of raw email for debugging
      console.log("Raw email preview:", email.substring(0, 500));
    }

    if (!replyText) {
      console.log(
        "No text content found in email after checking text, html, and raw email"
      );
      // Log the full raw email for debugging
      if (email) {
        console.log("Full raw email:", email);
      }
      const response = makeApiSuccess({ detail: "No text, ignoring" });
      return res.status(response.code).json(response);
    }

    console.log("Extracted reply text:", replyText.substring(0, 200));

    // Remove common email reply patterns
    const replyPatterns = [
      /On .+ wrote:/i,
      /-----\s*Original Message\s*-----/i,
      /From: .+/i,
      />+\s*.*/g, // Remove quoted lines starting with >
      /_{10,}/g, // Remove long underscores
      /-{10,}/g, // Remove long dashes
    ];

    for (const pattern of replyPatterns) {
      const match = replyText.search(pattern);
      if (match !== -1) {
        replyText = replyText.substring(0, match).trim();
        break;
      }
    }

    // Ensure we still have some text after cleaning
    if (!replyText || replyText.length === 0) {
      console.log("No reply text found after cleaning");
      const response = makeApiSuccess({
        detail: "No text after cleaning, ignoring",
      });
      return res.status(response.code).json(response);
    }

    // Add a subtle indicator that this was sent via email
    const finalText = `${replyText}\n\n(Sent via email reply)`;

    console.log(`Inserting message: "${finalText.substring(0, 100)}..."`);

    // Insert the reply message
    const { error: insertError } = await executeInsertChatMessageMutation({
      data: {
        chat_room_id: chatRoomId,
        sender_profile_id: senderProfile.id,
        text: finalText,
        reply_to_message_id: parseInt(replyToMessageId),
        metadata: {
          source: "email_reply",
          original_subject: subject || "",
          sender_email: senderEmail,
        },
      },
    });

    if (insertError) {
      console.error("Error inserting message:", insertError);
      throw makeApiError(insertError.message);
    }

    console.log("Reply processed successfully");
    const response = makeApiSuccess({ detail: "Reply processed successfully" });
    res.status(response.code).json(response);
  } catch (error) {
    console.error("Error processing email webhook:", error);
    // Return success to avoid SendGrid retries on our errors
    const response = makeApiSuccess({ detail: "Error processing, ignored" });
    res.status(response.code).json(response);
  }
}
