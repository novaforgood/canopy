import { User_Type_Enum } from "../../generated/graphql";
import {
  getFirstNameOfUser,
  getFullNameOfUser,
  getLastNameOfUser,
} from "../../lib/user";

import { ChatRoom, ProfileToChatRoom } from "./types";

export type ChatParticipant = {
  fullName: string;
  firstName: string;
  lastName: string;
  userType: User_Type_Enum | null;
  headline?: string;
  profileImage?: {
    url: string;
    id: string;
  };
  profileId: string;
  latestReadMessageId: number | null;
  id: string;
};
export function getChatParticipants(
  ptcrs: ProfileToChatRoom[]
): ChatParticipant[] {
  return ptcrs.map((ptcr) => ({
    fullName: getFullNameOfUser(ptcr.profile.user),
    firstName: getFirstNameOfUser(ptcr.profile.user),
    lastName: getLastNameOfUser(ptcr.profile.user),
    userType: ptcr.profile.user?.type ?? null,
    headline: ptcr.profile.profile_listing?.headline ?? undefined,
    profileImage: ptcr.profile.profile_listing?.profile_listing_image?.image,
    profileId: ptcr.profile.id,
    latestReadMessageId: ptcr.latest_read_chat_message_id ?? null,
    id: ptcr.id,
  }));
}

export function getChatRoomTitle(chatRoom: ChatRoom, currentProfileId: string) {
  const otherHumans = getChatParticipants(chatRoom.profile_to_chat_rooms)
    .filter((h) => h.userType !== User_Type_Enum.Bot)
    .filter((h) => h.profileId !== currentProfileId);

  const chatTitle = otherHumans.map((h) => h.fullName).join(", ");

  return chatTitle;
}

export function getChatRoomSubtitle(
  chatRoom: ChatRoom,
  currentProfileId: string
) {
  const otherHumans = getChatParticipants(chatRoom.profile_to_chat_rooms)
    .filter((h) => h.userType !== User_Type_Enum.Bot)
    .filter((h) => h.profileId !== currentProfileId);

  if (chatRoom.chat_intro_id) {
    return "";
  }

  return otherHumans.length == 1 ? otherHumans[0].headline : "Group Chat";
}

export function shouldHighlightChatRoom(
  chatRoom: ChatRoom, // The chat room to check
  chatRoomId: string, // The chat room that is currently open
  myProfileId: string // The profile that is currently logged in
) {
  const latestMessage = chatRoom.latest_chat_message[0];
  const myProfileEntry = chatRoom.profile_to_chat_rooms.find(
    (ptcr) => ptcr.profile.id === myProfileId
  );
  if (!myProfileEntry || !latestMessage || !chatRoomId) {
    return false;
  }

  if (latestMessage.sender_profile_id === myProfileEntry.profile.id)
    return false;

  if (chatRoom.id === chatRoomId) return false;

  if (
    myProfileEntry.latest_read_chat_message_id &&
    latestMessage.id <= myProfileEntry.latest_read_chat_message_id
  )
    return false;

  return true;
}
