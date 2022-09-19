import { z } from "zod";

import {
  executeGetChatRoomWithProfilesQuery,
  executeGetProfileQuery,
  executeInsertChatRoomOneMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiFail, makeApiSuccess } from "../../../server/response";

const connectEmailSchema = z.object({
  senderProfileId: z.string(),
  receiverProfileId: z.string(),
  firstMessage: z.string(),
});

export default applyMiddleware({
  authenticated: true,
  validationSchema: connectEmailSchema,
}).post(async (req, res) => {
  const { senderProfileId, receiverProfileId, firstMessage } = req.body;

  const [
    { data: senderData, error: senderError },
    { data: receiverData, error: receiverError },
    { data: chatRoomData, error: chatRoomError },
  ] = await Promise.all([
    executeGetProfileQuery({ profile_id: senderProfileId }),
    executeGetProfileQuery({ profile_id: receiverProfileId }),
    executeGetChatRoomWithProfilesQuery({
      profile_id_1: senderProfileId,
      profile_id_2: receiverProfileId,
    }),
  ]);
  if (
    senderError ||
    receiverError ||
    !senderData?.profile_by_pk ||
    !receiverData?.profile_by_pk
  ) {
    throw makeApiFail(
      senderError?.message ??
        receiverError?.message ??
        "Sender or receiver not found"
    );
  }

  if (chatRoomError) {
    throw makeApiFail(chatRoomError?.message ?? "Chat room fetching error");
  }
  if (chatRoomData?.chat_room.length) {
    throw makeApiFail("Chat room already exists");
  }

  const sender = senderData.profile_by_pk.user;
  const receiver = receiverData.profile_by_pk.user;
  if (sender.id === receiver.id) {
    throw makeApiFail("Cannot connect to yourself");
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

  const response = makeApiSuccess({ chatRoomId: chatRoomId });
  res.status(response.code).json(response);
});
