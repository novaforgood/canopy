import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic";

import { ChatRoom } from "./types";
import { getChatRoomTitle } from "./utils";

interface ChatTitleProps {
  chatRoom: ChatRoom;
  highlight?: boolean;
}
export function ChatTitle(props: ChatTitleProps) {
  const { chatRoom, highlight } = props;

  const { currentProfile } = useCurrentProfile();

  const chatTitle = getChatRoomTitle(chatRoom, currentProfile?.id ?? "");

  return (
    <Text className="truncate" bold={highlight}>
      {chatRoom.chat_intro_id && (
        <Text className="text-lime-700">[Intro] </Text>
      )}
      {chatTitle}
    </Text>
  );
}
