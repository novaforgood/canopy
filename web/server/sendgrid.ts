import sendgridMail from "@sendgrid/mail";

import { requireServerEnv } from "./env";
import { executeGetProfileQuery } from "./generated/serverGraphql";
import { makeApiError, makeApiFail } from "./response";

const EMAILS_DISABLED = requireServerEnv("DISABLE_EMAILS") === "true";

const SENDGRID_API_KEY = requireServerEnv("SENDGRID_API_KEY");
sendgridMail.setApiKey(SENDGRID_API_KEY);

const HOST_URL = requireServerEnv("HOST_URL");

export type SendgridProfile = {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  profilePicUrl: string;
};

export enum TemplateId {
  ConnectionRequest = "d-be75ba26790f45d68be187f7b110b616",
  FirstChatRoomMessage = "d-a36dca61b0a9433f904787ced5e00686",
  DailyChatMessageNotification = "d-da0723a2ee0242f4a9ef932d146ded61",
  ChatIntroNotification = "d-32d8eb503662482a825c4b202683fab0",
  ChatRoomNotification = "d-ff1ad2e5c5f949f39674ed9df5be3ea9",
}

type TemplateInfo = {
  [TemplateId.FirstChatRoomMessage]?: {
    replyUrl: string;
    message: string;
    spaceName: string;
    chatRoomId?: string;
    messageId?: string | number;
  };
  [TemplateId.ConnectionRequest]?: {
    introMessage?: string;
    availability: string;
    timezone: string;
    spaceName: string;
  };
  [TemplateId.DailyChatMessageNotification]?: {
    totalUnreadMessagesCount: number;
    messagesSenders: string; // e.g. Name1, Name2, and Name2
    senderProfiles: SendgridProfile[];
    viewChatsUrl: string;
  };
  [TemplateId.ChatIntroNotification]?: {
    groupMemberNames: string;
    groupMemberProfiles: SendgridProfile[];
    viewGroupChatUrl: string;
  };
  [TemplateId.ChatRoomNotification]?: {
    chatRoomId: string;
    latestMessageId: number;
    participantNames: string;
    messages: Array<{
      id: number;
      text: string;
      senderName: string;
      senderFirstName: string;
      senderProfilePic: string;
      createdAt: string;
      isReply: boolean;
      replyToText?: string;
      replyToSenderName?: string;
    }>;
    viewChatUrl: string;
    totalUnreadCount: number;
  };
};

export async function sendEmail<T extends TemplateId>({
  templateId,
  dynamicTemplateData,
  senderProfileId,
  receiverProfileId,
  ccSender = false,
}: {
  senderProfileId?: string;
  receiverProfileId: string;
  dynamicTemplateData:
    | TemplateInfo[T]
    | ((props: {
        sender: SendgridProfile | null;
        receiver: SendgridProfile;
        space: {
          name: string;
          slug: string;
        };
      }) => TemplateInfo[T]);
  templateId: T;
  ccSender?: boolean;
}) {
  if (EMAILS_DISABLED) {
    return;
  }

  const { sender, receiver, space } = await getSenderReceiverAndSpace({
    senderProfileId,
    receiverProfileId,
  });

  const data =
    typeof dynamicTemplateData === "function"
      ? dynamicTemplateData({ sender, receiver, space })
      : dynamicTemplateData;

  const EMAIL_REPLY_SUBDOMAIN = requireServerEnv("EMAIL_REPLY_SUBDOMAIN");
  // Build reply-to address if this is a chat message with IDs
  let replyTo = undefined;
  if (templateId === TemplateId.FirstChatRoomMessage && data) {
    const chatData = data as TemplateInfo[TemplateId.FirstChatRoomMessage];
    if (chatData?.chatRoomId && chatData?.messageId) {
      replyTo = `reply+${chatData.chatRoomId}+${chatData.messageId}@${EMAIL_REPLY_SUBDOMAIN}.joincanopy.org`;
    }
  } else if (templateId === TemplateId.ChatRoomNotification && data) {
    const chatData = data as TemplateInfo[TemplateId.ChatRoomNotification];
    if (chatData?.chatRoomId && chatData?.latestMessageId) {
      replyTo = `reply+${chatData.chatRoomId}+${chatData.latestMessageId}@${EMAIL_REPLY_SUBDOMAIN}.joincanopy.org`;
    }
  }

  console.log("sending email", {
    replyTo,
    sender,
    receiver,
    space,
    templateId,
    data,
    ccSender,
  });

  return sendgridMail
    .send({
      from: {
        email: "connect@joincanopy.org",
        name: "Canopy",
      },
      replyTo: replyTo,
      cc: sender && ccSender ? [sender.email] : undefined,
      to: receiver.email,
      templateId: templateId,
      dynamicTemplateData: {
        sender: sender ? sender : {},
        receiver: receiver,
        space: space,
        disableEmailNotificationsUrl: `${HOST_URL}/settings`,
        ...data,
      },
    })
    .catch((err) => {
      throw makeApiError(err.message);
    });
}

const PLACEHOLDER_IMAGE_URL = `https://canopy-prod.s3.us-west-2.amazonaws.com/placeholder_profile_pic.jpg`;

async function getSenderReceiverAndSpace(props: {
  senderProfileId?: string;
  receiverProfileId: string;
}) {
  const { senderProfileId, receiverProfileId } = props;

  if (senderProfileId === receiverProfileId) {
    throw makeApiFail("Cannot send email to yourself");
  }

  const senderPromise = senderProfileId
    ? executeGetProfileQuery({ profile_id: senderProfileId })
    : new Promise<null>((resolve) => resolve(null));
  const receiverPromise = executeGetProfileQuery({
    profile_id: receiverProfileId,
  });

  const [senderResponse, receiverResponse] = await Promise.all([
    senderPromise,
    receiverPromise,
  ]);

  if (senderResponse?.error || receiverResponse.error) {
    throw makeApiFail(
      senderResponse?.error?.message ??
        receiverResponse.error?.message ??
        "Error fetching sender or receiver"
    );
  }

  const sender = senderResponse?.data?.profile_by_pk ?? null;
  const receiver = receiverResponse.data?.profile_by_pk ?? null;

  if (!receiver || !receiver.user) {
    throw makeApiFail("No receiver for email");
  }

  const senderObject: SendgridProfile | null = sender
    ? {
        firstName: sender.user?.first_name ?? "",
        lastName: sender.user?.last_name ?? "",
        email: sender.user?.email ?? "",
        headline: sender.profile_listing?.headline ?? "",
        profilePicUrl:
          sender.profile_listing?.profile_listing_image?.image.url ??
          PLACEHOLDER_IMAGE_URL,
      }
    : null;

  const receiverObject: SendgridProfile = {
    firstName: receiver.user.first_name ?? "",
    lastName: receiver.user.last_name ?? "",
    email: receiver.user.email ?? "",
    headline: receiver.profile_listing?.headline ?? "",
    profilePicUrl:
      receiver.profile_listing?.profile_listing_image?.image.url ??
      PLACEHOLDER_IMAGE_URL,
  };

  const space = {
    name: receiver.space.name,
    slug: receiver.space.slug,
  };

  return { sender: senderObject, receiver: receiverObject, space };
}
