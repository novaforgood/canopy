import { ChatRoomFragmentFragment } from "../../generated/graphql";

export type ChatRoom = NonNullable<ChatRoomFragmentFragment>;

export type ProfileToChatRoom = ChatRoom["profile_to_chat_rooms"][number];
