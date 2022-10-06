import { ChatRoomSubscription, MessagesQuery } from "../../generated/graphql";

export type ChatMessage = MessagesQuery["chat_message"][number];
export type ChatRoom = ChatRoomSubscription["chat_room_by_pk"];
