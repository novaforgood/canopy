// Universal webhook handler endpoint
import { format } from "date-fns";
import { z } from "zod";

import { makeListSentence } from "../../common/lib/words";
import { requireServerEnv } from "../../server/env";
import {
  executeGetUnreadMessagesCountsQuery,
  executeGetUnreadMessagesPerChatRoomQuery,
} from "../../server/generated/serverGraphql";
import { applyMiddleware } from "../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../server/response";
import { sendEmail, SendgridProfile, TemplateId } from "../../server/sendgrid";

const CRON_CLIENT_KEY = requireServerEnv("CRON_CLIENT_KEY");
const HOST_URL = requireServerEnv("HOST_URL");
const MOBILE_APP_SCHEME = requireServerEnv("MOBILE_APP_SCHEME");

enum WebhookType {
  CronJob = "CronJob",
}

enum CronJobType {
  SendChatMessageNotification = "SendChatMessageNotification",
}

const cronSchema = z.object({
  payload: z.object({
    cronJobType: z.literal(CronJobType.SendChatMessageNotification),
  }),
});

export default applyMiddleware({
  authenticated: false,
  validationSchema: cronSchema,
}).post(async (req, res) => {
  const cronClientKey = req.headers["x-canopy-cron-client-key"];
  if (cronClientKey !== CRON_CLIENT_KEY) {
    throw makeApiFail("Invalid cron client key");
  }

  await handleCronJob(req.body.payload.cronJobType);

  const response = makeApiSuccess({ detail: "Success" });
  res.status(response.code).json(response);
});

const PLACEHOLDER_IMAGE_URL = `https://canopy-prod.s3.us-west-2.amazonaws.com/placeholder_profile_pic.jpg`;

async function handleCronJob(cronJobType: CronJobType) {
  switch (cronJobType) {
    case CronJobType.SendChatMessageNotification: {
      // Get messages from the past hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data, error } = await executeGetUnreadMessagesPerChatRoomQuery({
        since: oneHourAgo.toISOString(),
      });

      if (error) {
        throw makeApiError(error.message);
      }

      const profiles = data?.profile.filter(
        (profile) => !!profile.user // Filter out profiles without users
      );

      const emailPromises: Promise<any>[] = [];

      profiles?.forEach((profile) => {
        // Process each chat room for this profile
        profile.profile_to_chat_rooms.forEach((ptcr) => {
          const chatRoom = ptcr.chat_room;
          if (!chatRoom.chat_messages || chatRoom.chat_messages.length === 0) {
            return; // No new messages in this room
          }

          // Filter to only unread messages (messages after latest_read_chat_message_id)
          const unreadMessages = chatRoom.chat_messages.filter(
            (msg) =>
              msg.sender_profile?.id !== profile.id && // Not sent by the recipient
              (!ptcr.latest_read_chat_message_id ||
                msg.id > ptcr.latest_read_chat_message_id)
          );

          if (unreadMessages.length === 0) {
            return; // No unread messages from others
          }

          // Get participant names
          const participants = chatRoom.profile_to_chat_rooms
            .map((p) => p.profile.user)
            .filter((u) => u && u.id !== profile.user?.id)
            .map((u) => u?.first_name || "")
            .filter(Boolean);
          const participantNames = makeListSentence(participants);

          // Format messages for email
          const formattedMessages = unreadMessages.map((msg) => ({
            id: msg.id,
            text: msg.text,
            senderName:
              `${msg.sender_profile?.user?.first_name} ${msg.sender_profile?.user?.last_name}`.trim(),
            senderFirstName: msg.sender_profile?.user?.first_name || "",
            senderProfilePic: msg.sender_profile?.profile_listing?.profile_listing_image?.image?.url || 
              "https://canopy-prod.s3.us-west-2.amazonaws.com/placeholder_profile_pic.jpg",
            createdAt: format(new Date(msg.created_at), "h:mm a"),
            isReply: !!msg.reply_to_message_id,
            replyToText: msg.reply_to_message?.text,
            replyToSenderName:
              msg.reply_to_message?.sender_profile?.user?.first_name ??
              undefined,
          }));

          console.log("formattedMessages", formattedMessages);

          const latestMessageId = Math.max(...unreadMessages.map((m) => m.id));

          // Send email for this chat room
          const emailPromise = sendEmail({
            receiverProfileId: profile.id,
            templateId: TemplateId.ChatRoomNotification,
            dynamicTemplateData: ({ space }) => ({
              chatRoomId: chatRoom.id,
              latestMessageId: latestMessageId,
              participantNames,
              messages: formattedMessages,
              viewChatUrl: `${HOST_URL}/go/${MOBILE_APP_SCHEME}/space/${space.slug}/chat/${chatRoom.id}`,
              totalUnreadCount: unreadMessages.length,
            }),
          });

          emailPromises.push(emailPromise);
        });
      });

      await Promise.all(emailPromises).catch((err) => {
        console.error(err);
      });

      return;
    }
  }
}
