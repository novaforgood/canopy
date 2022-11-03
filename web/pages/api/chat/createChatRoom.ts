import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import {
  executeGetChatRoomWithProfilesQuery,
  executeGetProfileQuery,
  executeInsertChatRoomOneMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiFail, makeApiSuccess } from "../../../server/response";
import { sendEmail } from "../../../server/sendgrid";

import { TemplateId } from "./../../../server/sendgrid";

const HOST_URL = requireServerEnv("HOST_URL");

const createChatRoomSchema = z.object({
  senderProfileId: z.string(),
  receiverProfileId: z.string(),
  firstMessage: z.string(),
});

export default applyMiddleware({
  authenticated: true,
  validationSchema: createChatRoomSchema,
}).post(async (req, res) => {
  const { senderProfileId, receiverProfileId, firstMessage } = req.body;

  const { data: chatRoomData, error: chatRoomError } =
    await executeGetChatRoomWithProfilesQuery({
      profile_id_1: senderProfileId,
      profile_id_2: receiverProfileId,
    });

  if (chatRoomError) {
    throw makeApiFail(chatRoomError?.message ?? "Chat room fetching error");
  }
  if (chatRoomData?.chat_room.length) {
    throw makeApiFail("Chat room already exists");
  }

  const { error, data } = await executeInsertChatRoomOneMutation({
    data: {
      chat_messages: {
        data: [
          {
            text: firstMessage,
            sender_profile_id: senderProfileId,
          },
        ],
      },
      profile_to_chat_rooms: {
        data: [
          { profile_id: senderProfileId },
          { profile_id: receiverProfileId },
        ],
      },
    },
  });
  const chatRoomId = data?.insert_chat_room_one?.id;
  if (error || !chatRoomId) {
    throw makeApiFail(error?.message ?? "Chat room creation error");
  }

  await sendEmail({
    senderProfileId: senderProfileId,
    receiverProfileId: receiverProfileId,
    templateId: TemplateId.FirstChatRoomMessage,
    dynamicTemplateData: ({ space }) => ({
      replyUrl: `${HOST_URL}/space/${space.slug}/chat/${chatRoomId}`,
      message: firstMessage,
      spaceName: space.name,
    }),
  }).catch((err) => {
    console.error(err);
  });

  const response = makeApiSuccess({ chatRoomId: chatRoomId });
  res.status(response.code).json(response);
});
