import { useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { format } from "date-fns";
import { useRouter } from "next/router";

import { Chat_Message, User_Type_Enum } from "../../generated/graphql";
import { BxChevronLeft, BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrevious } from "../../hooks/usePrevious";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { Button, Text, Textarea } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../common/ProfileImage";
import { Tooltip } from "../tooltips";

import { ChatProfileImage } from "./ChatProfileImage";
import { ChatRoomImage } from "./ChatRoomImage";
import { ChatTitle } from "./ChatTitle";
import { RenderMessage } from "./RenderMessage";
import { useChatRoom } from "./useChatRoom";
import { useMessages } from "./useMessages";
import {
  getChatRoomSubtitle,
  getChatRoomTitle,
  getChatParticipants,
} from "./utils";

// Query specific types
type ChatMessage = Omit<Chat_Message, "chat_room" | "sender_profile">;

export function RenderChatRoom() {
  const router = useRouter();
  const renderDesktopMode = useMediaQuery({
    showIfBiggerThan: "md",
  });
  const spaceSlug = useQueryParam("slug", "string");
  const chatRoomId = useQueryParam("chatRoomId", "string");
  const baseRoute = `/space/${spaceSlug}/chat`;

  const { chatRoom, chatParticipants } = useChatRoom(chatRoomId ?? "");

  const { currentProfile } = useCurrentProfile();
  const {
    messagesList,
    onMessageSubmit,
    fetchMore,
    fetchingMessages,
    markMessageAsRead,
    noMoreMessages,
  } = useMessages(chatRoomId ?? "");
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    setNewMessage("");
  }, [chatRoomId]);

  const lastMessageIdByOther: number | null = useMemo(() => {
    return (
      messagesList.find(
        (m) =>
          currentProfile &&
          m.sender_profile_id &&
          m.sender_profile_id !== currentProfile.id
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

  // Chat topbar
  const otherHumans = getChatParticipants(chatRoom?.profile_to_chat_rooms ?? [])
    .filter((p) => p.userType === User_Type_Enum.User)
    .filter((p) => p.profileId !== currentProfile?.id);

  if (!chatRoom)
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-md">
        <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
          <ProfileImage className="h-10 w-10" />

          <Text loading={true} loadingWidthClassName="w-32">
            Loading...
          </Text>
        </div>
      </div>
    );

  const chatRoomName = getChatRoomTitle(chatRoom, currentProfile?.id ?? "");
  const chatHeadline = getChatRoomSubtitle(chatRoom, currentProfile?.id ?? "");

  return (
    <div className="flex h-full w-full  flex-col overflow-hidden rounded-md">
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

        <ChatRoomImage
          clickable={true}
          className="mr-3 h-10 w-10"
          profiles={otherHumans.map((p) => ({
            imageUrl: p.profileImage?.url,
            profileUrl: `/space/${spaceSlug}/profile/${p.profileId}`,
          }))}
        />

        <div>
          <ChatTitle chatRoom={chatRoom} />
          {chatHeadline && (
            <>
              <div></div>
              <Text
                variant="body2"
                className="text-gray-700"
                loading={!chatHeadline}
              >
                {chatHeadline}
              </Text>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col-reverse overflow-y-scroll overscroll-contain p-4">
        {currentProfile &&
          messagesList.map((message, idx) => {
            // Note: Messages are ordered by created_at DESC
            const prevMessage = messagesList[idx + 1] ?? null;
            const nextMessage = messagesList[idx - 1] ?? null;
            let nextMessageSentByMe = null;
            for (let j = idx - 1; j >= 0; j--) {
              const msg = messagesList[j];
              if (msg.sender_profile_id === currentProfile.id) {
                nextMessageSentByMe = msg;
                break;
              }
            }

            return (
              <RenderMessage
                key={message.id}
                message={message}
                prevMessage={prevMessage}
                nextMessage={nextMessage}
                nextMessageByMe={nextMessageSentByMe}
                chatParticipants={chatParticipants}
              />
            );
          })}
        {currentProfile && !noMoreMessages && (
          <div className="my-4 flex w-full justify-center">
            <Button
              variant="secondary"
              loading={fetchingMessages}
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
          placeholder={`Type a message to send...`}
          minRows={1}
          className="w-full"
          value={newMessage}
          onValueChange={setNewMessage}
          // Submit on enter without shift being held down.
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onMessageSubmit(newMessage);
              setNewMessage("");
            }
          }}
        />
        <IconButton
          onClick={() => {
            onMessageSubmit(newMessage);
            setNewMessage("");
          }}
          icon={<BxSend className="h-6 w-6" />}
        ></IconButton>
      </div>
    </div>
  );
}
