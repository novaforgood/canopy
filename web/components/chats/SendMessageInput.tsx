import { useCallback, useMemo, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useSendMessageMutation } from "../../generated/graphql";
import { BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { Textarea } from "../atomic";
import { IconButton } from "../buttons/IconButton";

import { useChatRoom } from "./useChatRoom";

const promiseQueue = new PromiseQueue();

interface SendMessageInputProps {
  chatRoomId: string | null;
  className?: string;
  onSubmit?: (processedMessage: string) => void;
}

export function SendMessageInput(props: SendMessageInputProps) {
  const { chatRoomId, className, onSubmit } = props;

  const { chatParticipants } = useChatRoom(chatRoomId ?? "");

  const [value, setValue] = useState<string>("");

  const chatRoomIdFromQuery = useQueryParam("chatRoomId", "string");
  const spaceSlug = useQueryParam("slug", "string");

  const { currentProfile } = useCurrentProfile();
  const myParticipant = useMemo(
    () => chatParticipants.find((p) => p.profileId === currentProfile?.id),
    [chatParticipants, currentProfile]
  );

  const router = useRouter();
  // Submitting a new message
  const [_, sendMessage] = useSendMessageMutation();

  const submitMessage = useCallback(
    async (newMessage: string) => {
      const processedMessage = newMessage.trim();
      if (processedMessage.length === 0) {
        return;
      }

      if (onSubmit) {
        onSubmit(processedMessage);
      } else if (chatRoomId) {
        if (!myParticipant) {
          toast.error("No current profile");
          return;
        }
        // Chat room id is set, so we can send the message.
        const promise = sendMessage({
          input: {
            chat_room_id: chatRoomId,
            sender_ptcr_id: myParticipant.id,
            text: processedMessage,
          },
        })
          .then((res) => {
            if (res.error) {
              throw new Error(res.error.message);
            }

            if (!chatRoomIdFromQuery) {
              router.push(`/space/${spaceSlug}/chat/${chatRoomId}`);
            }
          })
          .catch((error) => {
            toast.error(`Error sending message: ${error.message}`);
          })
          .finally(() => {});

        promiseQueue.enqueue(promise);
      } else {
        toast.error("No chat room id");
      }
    },
    [
      chatRoomId,
      chatRoomIdFromQuery,
      myParticipant,
      onSubmit,
      router,
      sendMessage,
      spaceSlug,
    ]
  );

  return (
    <div className={classNames("flex shrink-0 items-center gap-2", className)}>
      <Textarea
        // Only autofocus if we're in a chat room.
        autoFocus={!!chatRoomIdFromQuery}
        placeholder={`Type a message to send...`}
        minRows={1}
        className="w-full"
        value={value}
        onValueChange={setValue}
        // Submit on enter without shift being held down.
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMessage(value);
            setValue("");
          }
        }}
      />
      <IconButton
        onClick={() => {
          submitMessage(value);
          setValue("");
        }}
        icon={<BxSend className="h-6 w-6" />}
      ></IconButton>
    </div>
  );
}
