import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import {
  executeGetChatRoomQuery,
  executeInsertChatRoomOneMutation,
  Profile_Role_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiFail, makeApiSuccess } from "../../../server/response";
import { sendEmail } from "../../../server/sendgrid";

import { TemplateId } from "./../../../server/sendgrid";

const HOST_URL = requireServerEnv("HOST_URL");
const MOBILE_APP_SCHEME = requireServerEnv("MOBILE_APP_SCHEME");

const createChatRoomSchema = z.object({
  receiverProfileIds: z.array(z.string()).min(1).max(5),
  firstMessage: z.string(),
});

export default applyMiddleware({
  authenticated: true,
  authorizationsInSpace: [Profile_Role_Enum.Member],
  validationSchema: createChatRoomSchema,
}).post(async (req, res) => {
  const { receiverProfileIds, firstMessage } = req.body;

  const senderProfileId = req.callerProfile?.id;
  if (!senderProfileId) {
    throw makeApiFail("No sender profile id");
  }

  const allProfileIds = [senderProfileId, ...receiverProfileIds];

  const { data: chatRoomData, error: chatRoomError } =
    await executeGetChatRoomQuery({
      where: {
        _and: allProfileIds.map((profileId) => ({
          profile_to_chat_rooms: {
            profile_id: {
              _eq: profileId,
            },
          },
        })),
        profile_to_chat_rooms_aggregate: {
          count: {
            predicate: {
              _eq: allProfileIds.length,
            },
          },
        },
      },
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
        data: allProfileIds.map((profileId) => ({
          profile_id: profileId,
        })),
      },
    },
  });
  const chatRoomId = data?.insert_chat_room_one?.id;
  if (error || !chatRoomId) {
    throw makeApiFail(error?.message ?? "Chat room creation error");
  }

  await Promise.all(
    receiverProfileIds.map((receiverProfileId) => {
      return sendEmail({
        senderProfileId: senderProfileId,
        receiverProfileId: receiverProfileId,
        templateId: TemplateId.FirstChatRoomMessage,
        dynamicTemplateData: ({ space }) => ({
          replyUrl: `${HOST_URL}/go/${MOBILE_APP_SCHEME}/space/${space.slug}/chat/${chatRoomId}`,
          message: firstMessage,
          spaceName: space.name,
        }),
      });
    })
  ).catch((err) => {
    console.error(err);
  });

  const response = makeApiSuccess({ chatRoomId: chatRoomId });
  res.status(response.code).json(response);
});
