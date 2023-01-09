import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic/Text";

import { ChatRoom } from "./types";
import { getChatRoomTitle } from "./utils";

interface ChatTitleProps {
  chatRoom: ChatRoom;
  highlight?: boolean;
}
export function ChatTitle(props: ChatTitleProps) {
  const { chatRoom, highlight = false } = props;

  const { currentProfile } = useCurrentProfile();

  const chatTitle = getChatRoomTitle(chatRoom, currentProfile?.id ?? "");

  return (
    <Text variant={highlight ? "subheading2Bold" : "subheading2"}>
      {chatRoom.chat_intro_id && <Text color="lime700">[Intro] </Text>}
      {chatTitle}
    </Text>
  );
}
