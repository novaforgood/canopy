import { useRouter } from "next/router";
import { ReactNode, useCallback, useState } from "react";

import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/Navbar";
import { SpaceSplashPage } from "../../../../components/space-homepage/SpaceSplashPage";
import { CustomPage } from "../../../../types";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import {
  MessagesSubscription,
  useChatRoomQuery,
  useMessagesSubscription,
  useSendMessageMutation,
} from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { ProfileImage } from "../../../../components/ProfileImage";
import { Text, Textarea } from "../../../../components/atomic";
import { format } from "date-fns";
import classNames from "classnames";
import { BxMailSend, BxSend } from "../../../../generated/icons/regular";
import { BxsSend } from "../../../../generated/icons/solid";
import toast from "react-hot-toast";

const NewChatPage: CustomPage = () => {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();
  const chatRoomId = router.query.chatRoomId as string;

  const [{ data: chatRoomData }] = useChatRoomQuery({
    variables: {
      chat_room_id: chatRoomId,
      profile_id: currentProfile?.id ?? "",
    },
  });

  const [{ data: messagesData }] = useMessagesSubscription<
    MessagesSubscription["chat_message_stream"]
  >(
    {
      variables: {
        chat_room_id: chatRoomId,
      },
    },
    (messages = [], response) => {
      const ret = [...messages, ...response.chat_message_stream];
      return ret.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);
    }
  );

  const [_, sendMessage] = useSendMessageMutation();
  const [message, setMessage] = useState("");

  const onMessageSubmit = useCallback(async () => {
    if (!chatRoomId) {
      toast.error("No chat room id");
      return;
    }
    if (!currentProfile) {
      toast.error("No current profile");
      return;
    }

    const processedMessage = message.trim();
    await sendMessage({
      input: {
        chat_room_id: chatRoomId,
        sender_profile_id: currentProfile.id,
        text: processedMessage,
      },
    })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        } else {
          setMessage("");
        }
      })
      .catch((error) => {
        toast.error(`Error sending message: ${error.message}`);
      });
  }, [chatRoomId, currentProfile, message, sendMessage]);

  if (!currentProfile) {
    return <div>Not logged in</div>;
  }

  const otherProfile =
    chatRoomData?.chat_room_by_pk?.profile_to_chat_rooms[0].profile;
  if (!otherProfile) {
    return <div>Profile not found</div>;
  }

  const { first_name, last_name } = otherProfile.user;
  const image = otherProfile.profile_listing?.profile_listing_image?.image;

  console.log(messagesData);

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex items-center gap-3 bg-olive-50 p-4">
        <ProfileImage src={image?.url} className="h-10 w-10" />

        <div>
          <Text>
            {first_name} {last_name}
          </Text>
          <div></div>
          <Text variant="body2" className="text-gray-700">
            {otherProfile.profile_listing?.headline}
          </Text>
        </div>
      </div>

      <div className="p-4">
        {messagesData?.map((message, idx) => {
          const prevMessage = messagesData[idx - 1] ?? null;
          const nextMessage = messagesData[idx + 1] ?? null;

          const nextMessageIsFromDifferentSender =
            nextMessage?.sender_profile_id !== message.sender_profile_id;
          const prevMessageIsFromDifferentSender =
            prevMessage?.sender_profile_id !== message.sender_profile_id;

          if (message.sender_profile_id === currentProfile.id) {
            // Sent by me. Render chat bubble with my profile image on the right.

            return (
              <div className="flex items-end gap-3" key={message.id}>
                <div className="flex-1"></div>

                <div
                  className={classNames({
                    "flex flex-col items-end": true,
                    "mb-4": nextMessageIsFromDifferentSender,
                    "mb-1": !nextMessageIsFromDifferentSender,
                  })}
                >
                  <div
                    className={classNames({
                      "rounded-l-lg bg-lime-400 px-4 py-1.5": true,
                      "rounded-tr-lg": prevMessageIsFromDifferentSender,
                      "rounded-br-lg": nextMessageIsFromDifferentSender,
                    })}
                  >
                    <Text>{message.text}</Text>
                  </div>
                  {nextMessageIsFromDifferentSender && (
                    <Text className="mt-1 text-gray-700" variant="body3">
                      {format(new Date(message.created_at), "h:mm a")}
                    </Text>
                  )}
                </div>
              </div>
            );
          } else {
            // Sent by other. Render chat bubble with their profile image on the left.

            return (
              <div className="flex items-end gap-3" key={message.id}>
                <div
                  className={classNames({
                    "flex items-end gap-3": true,
                    "mb-4": nextMessageIsFromDifferentSender,
                    "mb-1": !nextMessageIsFromDifferentSender,
                  })}
                >
                  {nextMessageIsFromDifferentSender ? (
                    <ProfileImage src={image?.url} className="mb-4 h-10 w-10" />
                  ) : (
                    <div className="w-10"></div>
                  )}
                  <div
                    className={classNames({
                      "flex flex-col items-start": true,
                    })}
                  >
                    <div
                      className={classNames({
                        "rounded-r-lg bg-gray-100 px-4 py-1.5": true,
                        "rounded-tl-lg": prevMessageIsFromDifferentSender,
                        "rounded-bl-lg": nextMessageIsFromDifferentSender,
                      })}
                    >
                      <Text>{message.text}</Text>
                    </div>
                    {nextMessageIsFromDifferentSender && (
                      <Text className="mt-1 text-gray-700" variant="body3">
                        {format(new Date(message.created_at), "h:mm a")}
                      </Text>
                    )}
                  </div>
                </div>
                <div className="flex-1"></div>
              </div>
            );
          }
        })}
      </div>
      <div className="h-px w-full bg-gray-600"></div>
      <div className="flex items-center gap-4 p-4 pl-16">
        <Textarea
          placeholder={`Type a message to ${first_name}`}
          minRows={1}
          className="w-full"
          value={message}
          onValueChange={setMessage}
        />
        <button onClick={onMessageSubmit}>
          <BxSend className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};
export default NewChatPage;
