import { useState, useMemo, useCallback, useEffect } from "react";

import {
  useMessagesQuery,
  useUpdateLatestReadMessageMutation,
  useMessagesStreamSubscription,
  useSendMessageMutation,
  Chat_Message,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { toast } from "../CustomToast";

import { DEFAULT_ID_CAP, MESSAGES_PER_FETCH } from "./constants";
import { useChatRoom } from "./useChatRoom";

type ChatMessage = Omit<Chat_Message, "chat_room" | "sender_profile">;

const promiseQueue = new PromiseQueue();

export function useMessages(chatRoomId: string) {
  const [currentTime] = useState(new Date());

  const { currentProfile } = useCurrentProfile();

  const { chatRoom, chatParticipants } = useChatRoom(chatRoomId);

  const myProfileEntry = chatParticipants.find(
    (p) => p.profileId === currentProfile?.id
  );

  const [idCap, setIdCap] = useState(DEFAULT_ID_CAP);
  useEffect(() => {
    if (chatRoom?.id) {
      setIdCap(DEFAULT_ID_CAP);
    }
  }, [chatRoom?.id]);

  const [{ data: messagesData, fetching: fetchingMessages }] = useMessagesQuery(
    {
      pause: !chatRoom,
      variables: {
        chat_room_id: chatRoom?.id ?? "",
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
      if (message.chat_room_id !== chatRoom?.id) {
        return;
      }
      if (
        myProfileEntry.latestReadMessageId &&
        message.id <= myProfileEntry.latestReadMessageId
      ) {
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
    [chatRoom?.id, markAsRead, myProfileEntry]
  );

  useMessagesStreamSubscription<void>({
    pause: !chatRoom?.id,
    variables: {
      chat_room_id: chatRoom?.id ?? "",
      after: currentTime.toISOString(),
    },
  });

  const firstMessageId = chatRoom?.first_chat_message[0].id;

  const minId = useMemo(() => {
    if (!messagesData) {
      return null;
    }
    const ids = messagesData?.chat_message.map((m) => m.id);
    return Math.min(...ids);
  }, [messagesData]);

  // No more messages
  const noMoreMessages = minId === firstMessageId;

  const fetchMore = useCallback(() => {
    if (!minId) return;
    if (minId > 0) {
      setIdCap(minId);
    }
  }, [minId]);

  const [_, sendMessage] = useSendMessageMutation();

  const onMessageSubmit = useCallback(
    async (newMessage: string) => {
      const processedMessage = newMessage.trim();
      if (processedMessage.length === 0) {
        return;
      }

      if (!chatRoom?.id) {
        toast.error("No chat room id");
        return;
      }
      if (!currentProfile) {
        toast.error("No current profile");
        return;
      }
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
    },
    [chatRoom?.id, currentProfile, sendMessage]
  );

  const markLatestMessageAsRead = useCallback(async () => {
    if (!myProfileEntry) return;
    const latestMessageByOther = messagesList.find(
      (m) => m.sender_profile_id !== myProfileEntry.profileId
    );
    if (latestMessageByOther) {
      promiseQueue.enqueue(markMessageAsRead(latestMessageByOther));
    }
  }, [markMessageAsRead, messagesList, myProfileEntry]);

  // Mark latest chat message as read when window focuses
  useEffect(() => {
    markLatestMessageAsRead();
  }, [markLatestMessageAsRead]);

  return useMemo(
    () => ({
      messagesList,
      onMessageSubmit,
      fetchMore,
      fetchingMessages,
      markMessageAsRead,
      noMoreMessages,
    }),
    [
      messagesList,
      onMessageSubmit,
      fetchMore,
      fetchingMessages,
      markMessageAsRead,
      noMoreMessages,
    ]
  );
}
