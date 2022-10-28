import { useCallback, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  useMessagesQuery,
  useMessagesStreamSubscription,
  useSendMessageMutation,
  useUpdateLatestReadMessageMutation,
} from "../../generated/graphql";
import { BxChevronLeft, BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrevious } from "../../hooks/usePrevious";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { Button, Text, Textarea } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../ProfileImage";
import { Tooltip } from "../tooltips";

import { DEFAULT_ID_CAP, MESSAGES_PER_FETCH } from "./constants";
import { ChatMessage, ChatRoom } from "./types";

const promiseQueue = new PromiseQueue();

const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

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

export interface RenderChatRoomProps {
  chatRoom: NonNullable<ChatRoom>;
}

export function RenderChatRoom(props: RenderChatRoomProps) {
  const { chatRoom } = props;

  const router = useRouter();
  const renderDesktopMode = useMediaQuery({
    showIfBiggerThan: "md",
  });
  const spaceSlug = useQueryParam("slug", "string");
  const chatRoomId = useQueryParam("chatRoomId", "string");
  const baseRoute = `/space/${spaceSlug}/chat`;

  const [currentTime] = useState(new Date());

  const { currentProfile } = useCurrentProfile();

  const otherProfileEntry = chatRoom.profile_to_chat_rooms.find(
    (p) => currentProfile && p.profile.id !== currentProfile.id
  );
  const myProfileEntry = chatRoom.profile_to_chat_rooms.find(
    (p) => currentProfile && p.profile.id === currentProfile.id
  );

  const otherProfile = otherProfileEntry?.profile;

  const [idCap, setIdCap] = useState(DEFAULT_ID_CAP);
  const [{ data: messagesData, fetching: fetchingMessages }] = useMessagesQuery(
    {
      variables: {
        chat_room_id: chatRoom.id,
        limit: MESSAGES_PER_FETCH,
        id_cap: idCap,
      },
    }
  );
  const messagesList = useMemo(
    () => messagesData?.chat_message ?? [],
    [messagesData?.chat_message]
  );

  // Mark message as read
  const [__, markAsRead] = useUpdateLatestReadMessageMutation();
  const markMessageAsRead = useCallback(
    async (message?: ChatMessage) => {
      if (!myProfileEntry || !message) {
        return;
      }

      if (!message) {
        return;
      }
      if (message.chat_room_id !== chatRoom.id) {
        return;
      }
      if (message.id <= myProfileEntry.latest_read_chat_message_id) {
        // No point in updating if not increasing
        return;
      }

      // console.log("SUCCESSFULLY AS READ");
      // console.log("   ", message.id, message.text);
      // console.log("   ", myProfileEntry.id);
      return markAsRead({
        id: myProfileEntry.id,
        latest_read_chat_message_id: message.id,
      });
    },
    [chatRoom.id, markAsRead, myProfileEntry]
  );

  useMessagesStreamSubscription<void>({
    variables: {
      chat_room_id: chatRoom.id,
      after: currentTime.toISOString(),
    },
  });

  const firstMessageId = chatRoom.first_chat_message[0].id;

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

    if (!chatRoom.id) {
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
        chat_room_id: chatRoom.id,
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
  }, [message, chatRoom.id, currentProfile, sendMessage]);

  const { first_name, last_name } = otherProfile?.user ?? {};
  const image = otherProfile?.profile_listing?.profile_listing_image?.image;

  const markLatestMessageAsRead = useCallback(async () => {
    if (!myProfileEntry) return;
    const latestMessageByOther = messagesList.find(
      (m) => m.sender_profile_id !== myProfileEntry.profile.id
    );
    if (latestMessageByOther) {
      promiseQueue.enqueue(markMessageAsRead(latestMessageByOther));
    }
  }, [markMessageAsRead, messagesList, myProfileEntry]);

  // Mark latest chat message as read when window focuses
  useEffect(() => {
    const onFocus = () => {
      markLatestMessageAsRead();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [markLatestMessageAsRead]);

  const lastMessageIdByOther: number = useMemo(() => {
    return (
      messagesList.find(
        (m) => currentProfile && m.sender_profile_id !== currentProfile.id
      )?.id ?? null
    );
  }, [messagesList, currentProfile]);

  const prevLastMessageIdByOther = usePrevious(lastMessageIdByOther);

  useEffect(() => {
    if (document.hidden) {
      return;
    }
    if (
      lastMessageIdByOther &&
      lastMessageIdByOther !== prevLastMessageIdByOther
    ) {
      const newMessage = messagesList.find(
        (m) => m.id === lastMessageIdByOther
      );
      markMessageAsRead(newMessage);
    }
  }, [
    lastMessageIdByOther,
    markMessageAsRead,
    messagesList,
    prevLastMessageIdByOther,
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center bg-olive-50 px-4 shadow-sm">
        {!renderDesktopMode && (
          <button
            className="-ml-2 mr-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-olive-100"
            onClick={() => {
              router.push(baseRoute);
            }}
          >
            <BxChevronLeft className="h-10 w-10" />
          </button>
        )}
        <Link href={`/space/${spaceSlug}/profile/${otherProfile?.id}`} passHref>
          <ProfileImage
            src={image?.url}
            className="mr-3 h-10 w-10 cursor-pointer"
          />
        </Link>

        <div>
          <Text loading={!first_name} loadingWidthClassName="w-4">
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
                    {isLastMessage ? (
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
}
