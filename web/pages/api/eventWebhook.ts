// Universal webhook handler endpoint
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { z } from "zod";

import { requireServerEnv } from "../../server/env";
import {
  executeGetChatParticipantsQuery,
  executeGetProfileQuery,
  executeInsertChatMessageMutation,
} from "../../server/generated/serverGraphql";
import { applyMiddleware } from "../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../server/response";

const EVENT_CLIENT_KEY = requireServerEnv("EVENT_CLIENT_KEY");
const EXPO_ACCESS_TOKEN = requireServerEnv("EXPO_ACCESS_TOKEN");

const expo = new Expo({ accessToken: EXPO_ACCESS_TOKEN });

const sessionVariablesSchema = z.record(z.any());
const columnValuesSchema = z.record(z.any()).or(z.null());

const eventTriggerSchema = z
  .object({
    event: z.object({
      session_variables: sessionVariablesSchema,
      op: z.string(),
      data: z.object({
        old: columnValuesSchema,
        new: columnValuesSchema,
      }),
    }),
    created_at: z.string(),
    id: z.string(),
    trigger: z.object({
      name: z.string(),
    }),
    table: z.object({
      schema: z.string(),
      name: z.string(),
    }),
  })
  .passthrough();

type RequestSchema = z.infer<typeof eventTriggerSchema>;
type Event = RequestSchema["event"];

export default applyMiddleware({
  authenticated: false,
  validationSchema: eventTriggerSchema,
}).post(async (req, res) => {
  const eventClientKey = req.headers["x-canopy-event-client-key"];
  console.log("eventClientKey", eventClientKey);
  if (eventClientKey !== EVENT_CLIENT_KEY) {
    throw makeApiFail("Invalid cron client key");
  }

  const { trigger } = req.body;

  switch (trigger.name) {
    case "on_chat_message_insert": {
      await handleChatMessageInsert(req.body.event);
      break;
    }
    case "on_ptcr_delete": {
      await handlePtcrDelete(req.body.event);
    }
  }

  const response = makeApiSuccess({ detail: "Success" });
  res.status(response.code).json(response);
});

/**
 * Handle a ptcr delete event
 * Add a system message to the chat room
 */
async function handlePtcrDelete(event: Event) {
  const deletedPtcr = event.data.old;

  if (!deletedPtcr) {
    throw makeApiError("No deleted ptcr");
  }

  const chatRoomId = deletedPtcr.chat_room_id as string;
  const profileId = deletedPtcr.profile_id as string;

  const { data, error } = await executeGetProfileQuery({
    profile_id: profileId,
  });
  if (error) {
    throw makeApiError(error.message);
  }
  if (!data?.profile_by_pk?.user) {
    throw makeApiError("User not found");
  }

  const { first_name, last_name } = data.profile_by_pk.user;
  const fullName = `${first_name} ${last_name}`;

  const { error: chatRoomError } = await executeInsertChatMessageMutation({
    data: {
      chat_room_id: chatRoomId,
      text: `${fullName} left the group.`,
      is_system_message: true,
      metadata: {
        profileId: profileId,
      },
    },
  });
  if (chatRoomError) {
    throw makeApiError(chatRoomError.message);
  }
}

/**
 * Handle a chat message insert event
 * Send a push notification to all participants in the chat room
 */
async function handleChatMessageInsert(event: Event) {
  const newMessage = event.data.new;

  if (!newMessage) {
    throw makeApiError("No new message");
  }

  if (newMessage.is_system_message) {
    // Ignore system messages
    return;
  }

  const { data, error } = await executeGetChatParticipantsQuery({
    chat_room_id: newMessage.chat_room_id,
  });
  if (error) {
    throw makeApiError(error.message);
  }
  if (!data) {
    throw makeApiError("No data");
  }

  const senderProfile = data.profile_to_chat_room.find(
    (ptcr) => ptcr.profile.id === newMessage.sender_profile_id
  )?.profile;
  if (!senderProfile) {
    throw makeApiError("No sender profile");
  }

  const messages: ExpoPushMessage[] = [];
  data.profile_to_chat_room.forEach((ptcr) => {
    // Don't send a notification to the sender
    if (ptcr.profile.id === newMessage.sender_profile_id) {
      return;
    }

    const token = ptcr.profile.user?.expo_push_token;
    if (token) {
      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
      } else {
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: token,
          sound: "default",
          title: `${senderProfile.user?.first_name} ${senderProfile.user?.last_name}`,
          body: newMessage.text,
          data: {
            chatRoomId: newMessage.chat_room_id,
            spaceId: senderProfile.space_id,
          },
        });
      }
    }
  });

  const chunks = expo.chunkPushNotifications(messages);
  await Promise.all(
    chunks.map((chunk) => expo.sendPushNotificationsAsync(chunk))
  ).catch((error) => {
    throw makeApiError(error.message);
  });
}
