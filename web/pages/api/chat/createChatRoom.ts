import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import {
  executeGetChatRoomWithProfilesQuery,
  executeGetProfileQuery,
  executeInsertChatRoomOneMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiFail, makeApiSuccess } from "../../../server/response";
import { sendgridMail } from "../../../server/sendgrid";

const PLACEHOLDER_IMAGE_URL = `https://canopy-prod.s3.us-west-2.amazonaws.com/placeholder_profile_pic.jpg`;
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

  const { name: spaceName, slug: spaceSlug } = receiverData.profile_by_pk.space;

  // Send e-mail
  const dynamicTemplateData = {
    sender: {
      firstName: sender.first_name,
      lastName: sender.last_name,
      headline: senderData.profile_by_pk.profile_listing?.headline ?? "",
      profilePicUrl:
        senderData.profile_by_pk.profile_listing?.profile_listing_image?.image
          .url ?? PLACEHOLDER_IMAGE_URL,
    },
    replyUrl: `${HOST_URL}/space/${spaceSlug}/chat/${chatRoomId}`,
    message: firstMessage,
    spaceName: spaceName,
  };
  await sendgridMail
    .send({
      from: {
        email: "connect@joincanopy.org",
        name: "Canopy",
      },
      to: receiver.email,
      templateId: "d-a36dca61b0a9433f904787ced5e00686",
      dynamicTemplateData: dynamicTemplateData,
    })
    .catch((err) => {
      // We don't want to fail the request if the e-mail fails to send
      console.error(err);
    });

  const response = makeApiSuccess({ chatRoomId: chatRoomId });
  res.status(response.code).json(response);
});
