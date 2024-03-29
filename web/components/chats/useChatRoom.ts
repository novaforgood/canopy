import { useMemo } from "react";

import { ChatRoomQuery, useChatRoomQuery } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";

import { getChatParticipants } from "./utils";

export function useChatRoom(chatRoomId: string) {
  const [{ data: chatRoomData }] = useChatRoomQuery({
    pause: !chatRoomId,
    variables: { chat_room_id: chatRoomId ?? "" },
  });
  const chatRoom = chatRoomData?.chat_room_by_pk;

  return useMemo(
    () => ({
      chatParticipants: getChatParticipants(
        chatRoom?.profile_to_chat_rooms ?? []
      ),
      chatRoom,
    }),
    [chatRoom]
  );
}
