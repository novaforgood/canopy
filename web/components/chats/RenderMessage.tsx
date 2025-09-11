import { useCallback } from "react";

import { useHover } from "@mantine/hooks";
import classNames from "classnames";
import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  Chat_Message,
  useUpdateChatMessageMutation,
} from "../../generated/graphql";
import { BxDotsVerticalRounded, BxTrash } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic";
import { Dropdown } from "../atomic/Dropdown";
import { IconButton } from "../buttons/IconButton";
import { Tooltip } from "../tooltips";

import { ChatProfileImage } from "./ChatProfileImage";
import { ChatParticipant } from "./utils";

type ChatMessage = Omit<
  Chat_Message,
  "chat_room" | "sender_profile" | "message_replies" | "reply_to_message"
> & {
  reply_to_message?: {
    id: number;
    text: string;
    sender_profile_id?: string | null;
    sender_profile?: {
      id: string;
      user?: {
        first_name?: string | null;
        last_name?: string | null;
      } | null;
    } | null;
  } | null;
};

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

function shouldTimeBreak(
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

function shouldBreak(
  message1: ChatMessage | null,
  message2: ChatMessage | null
) {
  if (!message1 || !message2) {
    return true;
  }
  if (message1.sender_profile_id !== message2.sender_profile_id) {
    return true;
  }
  return shouldTimeBreak(message1, message2);
}

interface ChatMessageDropdownProps {
  message: ChatMessage;
}

function ChatMessageDropdown(props: ChatMessageDropdownProps) {
  const { message } = props;

  const [, updateChatMessage] = useUpdateChatMessageMutation();
  const promptDelete = useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to delete this message? The text will be hidden, but others will see that you deleted a message. Also, note that deleted messages are retained for a period of time for reporting purposes."
      )
    ) {
      return;
    }
    updateChatMessage({
      chat_message_id: message.id,
      changes: {
        deleted: true,
      },
    })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        }

        toast.success("Message deleted!");
      })
      .catch((err) => {
        toast.error("Error deleting announcement:", err.message);
      });
  }, [message.id, updateChatMessage]);

  if (message.deleted) {
    return null;
  }

  return (
    <div>
      <Dropdown
        items={[
          {
            label: "Delete",
            onClick: promptDelete,
          },
        ]}
        renderButton={() => {
          return (
            <IconButton
              icon={<BxDotsVerticalRounded className="h-4 w-4 text-gray-700" />}
              className="rounded-full"
            />
          );
        }}
      />
    </div>
  );
}

interface RenderMessageProps {
  message: ChatMessage;
  prevMessage: ChatMessage | null;
  nextMessage: ChatMessage | null;
  nextMessageByMe: ChatMessage | null;
  chatParticipants: ChatParticipant[];
}
export function RenderMessage(props: RenderMessageProps) {
  // Note: Messages are ordered by created_at DESC
  const {
    message,
    prevMessage,
    nextMessage,
    nextMessageByMe,
    chatParticipants,
  } = props;

  const { currentProfile } = useCurrentProfile();
  const { hovered, ref } = useHover();

  const timeBreakBefore = shouldTimeBreak(prevMessage, message);
  const breakBefore = shouldBreak(prevMessage, message);
  const breakAfter = shouldBreak(message, nextMessage);

  const nextMessageIsFromDifferentSender =
    nextMessage?.sender_profile_id !== message.sender_profile_id;

  let messageJsxElement = null;
  if (message.sender_profile_id === currentProfile?.id) {
    // Sent by me. Render chat bubble with my profile image on the right.
    const isPending = typeof message.id === "string";

    // Find next message sent by me

    const isLastDelivered =
      !isPending &&
      (nextMessage === null ||
        nextMessageByMe === null ||
        typeof nextMessageByMe.id === "string");

    messageJsxElement = (
      <div
        className={classNames({
          "flex min-w-0 max-w-full flex-col items-end pl-14": true,
          "mb-4": breakAfter,
          "mb-1": !breakAfter,
        })}
      >
        <div className="flex min-w-0 max-w-full items-center justify-end gap-1 lg:ml-24">
          <div className="w-8 shrink-0">
            {hovered && <ChatMessageDropdown message={message} />}
          </div>
          <Tooltip
            enabled={!message.deleted}
            content={formatDateConcisely(new Date(message.created_at))}
            placement="left"
            delayMs={[500, 0]}
          >
            <div
              className={classNames({
                "min-w-0 max-w-full whitespace-pre-wrap rounded-l-lg px-4 py-1.5 ":
                  true,
                "bg-lime-300": isPending,
                "bg-lime-400": !isPending,
                "text-gray-700": message.deleted,
                "rounded-tr-lg": breakBefore,
                "rounded-br-lg": breakAfter,
              })}
            >
              {message.reply_to_message && !message.deleted && (
                <div className="mb-2">
                  <div>
                    <Text variant="body2" className="text-gray-600">
                      Replying to{" "}
                      {message.reply_to_message.sender_profile?.user
                        ?.first_name || "Unknown"}
                    </Text>
                  </div>
                  <div className="mt-1 border-l-2 pl-2">
                    <Text variant="body3" className=" text-gray-700">
                      {message.reply_to_message.text}
                    </Text>
                  </div>
                </div>
              )}
              <Text className="break-words" italic={message.deleted}>
                {message.deleted ? "Message was deleted" : message.text}
              </Text>
            </div>
          </Tooltip>
        </div>

        {isLastDelivered && (
          <Text variant="body3" className="mt-px text-gray-700">
            Delivered
          </Text>
        )}
      </div>
    );
  } else {
    // Sent by other. Render chat bubble with their profile image on the left.
    const isLastMessage = breakAfter || nextMessageIsFromDifferentSender;

    const senderProfile =
      chatParticipants.find((p) => p.profileId === message.sender_profile_id) ??
      null;

    if (!senderProfile) {
      if (message.is_system_message) {
        return (
          <div className="mx-auto mb-4">
            <Text variant="body2" className="text-gray-700">
              {message.text}
            </Text>
          </div>
        );
      } else {
        return null;
      }
    }

    const firstName = senderProfile.firstName;
    const lastName = senderProfile.lastName;
    const profileImageUrl = senderProfile.profileImage?.url;

    messageJsxElement = (
      <div className="flex min-w-0 max-w-full items-end gap-3">
        <div
          className={classNames({
            "flex min-w-0 max-w-full items-end gap-3": true,
            "mb-4": isLastMessage,
            "mb-1": !isLastMessage,
          })}
        >
          {isLastMessage ? (
            <div className="relative w-10 shrink-0">
              <Tooltip content={`${firstName} ${lastName}`} placement="left">
                <div className="absolute bottom-0 h-10 w-10 shrink-0">
                  <ChatProfileImage
                    src={profileImageUrl}
                    userType={senderProfile.userType}
                    className="h-10 w-10"
                  />
                </div>
              </Tooltip>
            </div>
          ) : (
            <div className="w-10 shrink-0"></div>
          )}
          <Tooltip
            content={formatDateConcisely(new Date(message.created_at))}
            placement="left"
            delayMs={[500, 0]}
            enabled={!message.deleted}
          >
            <div
              className={classNames({
                "mr-12 min-w-0 max-w-full whitespace-pre-wrap rounded-r-lg bg-gray-100 px-4 py-1.5":
                  true,
                "rounded-tl-lg": breakBefore,
                "rounded-bl-lg": breakAfter,
                "text-gray-700": message.deleted,
              })}
            >
              {message.reply_to_message && !message.deleted && (
                <div className="mb-2">
                  <div>
                    <Text variant="body2" className="text-gray-600">
                      Replying to{" "}
                      {message.reply_to_message.sender_profile?.user
                        ?.first_name || "Unknown"}
                    </Text>
                  </div>
                  <div className="mt-1 border-l-2 pl-2">
                    <Text variant="body3" className=" text-gray-700">
                      {message.reply_to_message.text}
                    </Text>
                  </div>
                </div>
              )}
              <Text className="break-words" italic={message.deleted}>
                {message.deleted ? "Message was deleted" : message.text}
              </Text>
            </div>
          </Tooltip>
        </div>
        <div className="flex-1"></div>
      </div>
    );
  }

  return (
    <div key={message.id} className="w-full">
      {timeBreakBefore && (
        <div className="mt-4 mb-2 flex w-full items-center justify-center">
          <Text className="text-gray-700" variant="body3">
            {formatDateConcisely(new Date(message.created_at))}
          </Text>
        </div>
      )}
      <div ref={ref}>{messageJsxElement}</div>
    </div>
  );
}
