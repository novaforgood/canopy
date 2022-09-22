import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { format } from "date-fns";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text, Textarea } from "../../../../components/atomic";
import { IconButton } from "../../../../components/buttons/IconButton";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import {
  DEFAULT_ID_CAP,
  MESSAGES_PER_FETCH,
} from "../../../../components/chats/constants";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { SpaceSplashPage } from "../../../../components/space-homepage/SpaceSplashPage";
import { Tooltip } from "../../../../components/tooltips";
import {
  Chat_Message,
  MessagesQuery,
  MessagesStreamSubscription,
  useChatRoomQuery,
  useMessagesQuery,
  useMessagesStreamSubscription,
  useSendMessageMutation,
} from "../../../../generated/graphql";
import { BxMailSend, BxSend } from "../../../../generated/icons/regular";
import { BxsSend } from "../../../../generated/icons/solid";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { PromiseQueue } from "../../../../lib/PromiseQueue";
import { CustomPage } from "../../../../types";

const promiseQueue = new PromiseQueue();

const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

type ChatMessage = MessagesQuery["chat_message"][number];

function formatDateConcisely(date: Date): string {
  const timeAgo = Math.abs(date.getTime() - Date.now());
  if (timeAgo > ONE_WEEK) {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } else if (timeAgo > ONE_DAY) {
    return format(date, "EEEE 'at' h:mm a");
  } else {
    return format(date, "h:mm a");
  }
}

function shouldBreak(
  message1: ChatMessage | null,
  message2: ChatMessage | null
) {
  if (!message1 || !message2) {
    return true;
  }
  const date1 = new Date(message1.created_at);
  const date2 = new Date(message2.created_at);
  const diff = date2.getTime() - date1.getTime();

  return diff > FIVE_MINUTES;
}

const NewChatPage: CustomPage = () => {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();
  const chatRoomId = router.query.chatRoomId as string;

  const [currentTime] = useState(new Date());

  const [{ data: chatRoomData }] = useChatRoomQuery({
    variables: {
      chat_room_id: chatRoomId,
      profile_id: currentProfile?.id ?? "",
    },
  });

  useMessagesStreamSubscription<number>({
    variables: { chat_room_id: chatRoomId, after: currentTime.toISOString() },
  });

  const [idCap, setIdCap] = useState(DEFAULT_ID_CAP);

  const [{ data: messagesData, fetching: fetchingMessages }] = useMessagesQuery(
    {
      variables: {
        chat_room_id: chatRoomId,
        limit: MESSAGES_PER_FETCH,
        id_cap: idCap,
      },
    }
  );

  const firstMessageId =
    chatRoomData?.chat_room_by_pk?.first_chat_message[0].id;

  const minId = useMemo(() => {
    if (!messagesData) {
      return null;
    }
    const ids = messagesData?.chat_message.map((m) => m.id);
    return Math.min(...ids);
  }, [messagesData]);

  const noMoreMessages = minId === firstMessageId;

  const fetchMore = useCallback(() => {
    if (!minId) return;
    if (minId > 0) {
      setIdCap(minId);
    }
  }, [minId]);

  const loadMoreDisabled = idCap === minId;

  const [_, sendMessage] = useSendMessageMutation();
  const [message, setMessage] = useState("");

  const onMessageSubmit = useCallback(async () => {
    const processedMessage = message.trim();
    if (processedMessage.length === 0) {
      return;
    }

    if (!chatRoomId) {
      toast.error("No chat room id");
      return;
    }
    if (!currentProfile) {
      toast.error("No current profile");
      return;
    }
    setMessage("");
    const promise = sendMessage({
      input: {
        chat_room_id: chatRoomId,
        sender_profile_id: currentProfile.id,
        text: processedMessage,
      },
    })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        }
      })
      .catch((error) => {
        toast.error(`Error sending message: ${error.message}`);
      })
      .finally(() => {});

    promiseQueue.enqueue(promise);
  }, [message, chatRoomId, currentProfile, sendMessage]);

  const otherProfile =
    chatRoomData?.chat_room_by_pk?.profile_to_chat_rooms[0].profile;

  const { first_name, last_name } = otherProfile?.user ?? {};
  const image = otherProfile?.profile_listing?.profile_listing_image?.image;

  const messagesList = messagesData?.chat_message ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
        <ProfileImage src={image?.url} className="h-10 w-10" />

        <div>
          <Text loading={!first_name}>
            {first_name} {last_name}
          </Text>
          <div></div>
          <Text
            variant="body2"
            className="text-gray-700"
            loading={!otherProfile}
          >
            {otherProfile?.profile_listing?.headline}
          </Text>
        </div>
      </div>

      <div className="flex flex-1 flex-col-reverse overflow-y-scroll overscroll-contain p-4">
        {currentProfile &&
          messagesList.map((message, idx) => {
            // Note: Messages are ordered by created_at DESC
            const prevMessage = messagesList[idx + 1] ?? null;
            const nextMessage = messagesList[idx - 1] ?? null;

            const breakBefore = shouldBreak(prevMessage, message);
            const breakAfter = shouldBreak(message, nextMessage);

            const nextMessageIsFromDifferentSender =
              nextMessage?.sender_profile_id !== message.sender_profile_id;

            let messageJsxElement = null;
            if (message.sender_profile_id === currentProfile.id) {
              // Sent by me. Render chat bubble with my profile image on the right.
              const isPending = typeof message.id === "string";

              // Find next message sent by me

              let nextMessageSentByMe = null;
              for (let j = idx - 1; j >= 0; j--) {
                const msg = messagesList[j];
                if (msg.sender_profile_id === currentProfile.id) {
                  nextMessageSentByMe = msg;
                  break;
                }
              }
              const isLastDelivered =
                !isPending &&
                (nextMessage === null ||
                  nextMessageSentByMe === null ||
                  typeof nextMessageSentByMe.id === "string");

              messageJsxElement = (
                <div className="flex items-end gap-3">
                  <div className="flex-1"></div>

                  <div
                    className={classNames({
                      "flex flex-col items-end": true,
                      "mb-4": breakAfter,
                      "mb-1": !breakAfter,
                    })}
                  >
                    <Tooltip
                      content={formatDateConcisely(
                        new Date(message.created_at)
                      )}
                      placement="left"
                      delayMs={[500, 0]}
                    >
                      <div
                        className={classNames({
                          "ml-12 whitespace-pre-wrap rounded-l-lg px-4 py-1.5 lg:ml-20":
                            true,
                          "bg-lime-300": isPending,
                          "bg-lime-400": !isPending,
                          "rounded-tr-lg": breakBefore,
                          "rounded-br-lg": breakAfter,
                        })}
                      >
                        <Text>{message.text}</Text>
                      </div>
                    </Tooltip>

                    {isLastDelivered && (
                      <Text variant="body3" className="mt-px text-gray-700">
                        Delivered
                      </Text>
                    )}
                  </div>
                </div>
              );
            } else {
              // Sent by other. Render chat bubble with their profile image on the left.

              const isLastMessage =
                breakAfter || nextMessageIsFromDifferentSender;

              messageJsxElement = (
                <div className="flex items-end gap-3">
                  <div
                    className={classNames({
                      "flex items-end gap-3": true,
                      "mb-4": isLastMessage,
                      "mb-1": !isLastMessage,
                    })}
                  >
                    {nextMessageIsFromDifferentSender ? (
                      <div className="relative w-10 shrink-0">
                        <Tooltip
                          content={`${first_name} ${last_name}`}
                          placement="left"
                        >
                          <div className="absolute bottom-0 h-10 w-10 shrink-0">
                            <ProfileImage
                              src={image?.url}
                              className="h-10 w-10"
                            />
                          </div>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="w-10 shrink-0"></div>
                    )}
                    <Tooltip
                      content={formatDateConcisely(
                        new Date(message.created_at)
                      )}
                      placement="left"
                      delayMs={[500, 0]}
                    >
                      <div
                        className={classNames({
                          "mr-12 whitespace-pre-wrap rounded-r-lg bg-gray-100 px-4 py-1.5 lg:mr-20":
                            true,
                          "rounded-tl-lg": breakBefore,
                          "rounded-bl-lg": breakAfter,
                        })}
                      >
                        <Text>{message.text}</Text>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex-1"></div>
                </div>
              );
            }

            return (
              <div key={message.id}>
                {breakBefore && (
                  <div className="mt-4 mb-2 flex w-full items-center justify-center">
                    <Text className="text-gray-700" variant="body3">
                      {formatDateConcisely(new Date(message.created_at))}
                    </Text>
                  </div>
                )}
                {messageJsxElement}
              </div>
            );
          })}
        {currentProfile && !noMoreMessages && (
          <div className="my-4 flex w-full justify-center">
            <Button
              variant="secondary"
              loading={loadMoreDisabled}
              size="small"
              onClick={() => {
                fetchMore();
              }}
            >
              Load more...
            </Button>
          </div>
        )}
      </div>
      <div className="h-px w-full shrink-0 bg-gray-600"></div>
      <div className="flex shrink-0 items-center gap-2 p-4 pl-16">
        <Textarea
          placeholder={`Type a message to ${first_name}`}
          minRows={1}
          className="w-full"
          value={message}
          onValueChange={setMessage}
          // Submit on enter without shift being held down.
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onMessageSubmit();
            }
          }}
        />
        <IconButton
          onClick={onMessageSubmit}
          icon={<BxSend className="h-6 w-6" />}
        ></IconButton>
      </div>
    </div>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};

export default NewChatPage;
