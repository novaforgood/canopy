import { ChatRoomQuery, MessagesQuery } from "../../generated/graphql";

export type ChatMessage = MessagesQuery["chat_message"][number];
export type ChatRoom = NonNullable<ChatRoomQuery["chat_room_by_pk"]>;
