import { useCallback } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  Chat_Message,
  User_Type_Enum,
  useSendMessageMutation,
} from "../../generated/graphql";
import { BxChevronLeft } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { Text } from "../atomic";
import { ProfileImage } from "../common/ProfileImage";

import { ChatRoomImage } from "./ChatRoomImage";
import { ChatTitle } from "./ChatTitle";
import { RenderChatRoomMessages } from "./RenderChatRoomMessages";
import { SendMessageInput } from "./SendMessageInput";
import { useChatRoom } from "./useChatRoom";
import { getChatRoomSubtitle, getChatParticipants } from "./utils";

export function RenderChatRoom() {
  const router = useRouter();
  const renderDesktopMode = useMediaQuery({
    showIfBiggerThan: "md",
  });
  const spaceSlug = useQueryParam("slug", "string");
  const chatRoomId = useQueryParam("chatRoomId", "string");
  const baseRoute = `/space/${spaceSlug}/chat`;

  const { chatRoom } = useChatRoom(chatRoomId ?? "");

  const { currentProfile } = useCurrentProfile();

  // Chat topbar
  const otherHumans = getChatParticipants(chatRoom?.profile_to_chat_rooms ?? [])
    .filter((p) => p.userType === User_Type_Enum.User)
    .filter((p) => p.profileId !== currentProfile?.id);

  if (!chatRoom)
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-md">
        <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
          <ProfileImage className="h-10 w-10" />

          <Text loading={true} loadingWidthClassName="w-32">
            Loading...
          </Text>
        </div>
      </div>
    );

  const chatHeadline = getChatRoomSubtitle(chatRoom, currentProfile?.id ?? "");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center bg-olive-50 px-4 shadow-sm">
        {!renderDesktopMode && (
          <button
            className="-ml-2 mr-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-olive-100"
            onClick={() => {
              router.push(baseRoute);
            }}
          >
            <BxChevronLeft className="h-10 w-10" />
          </button>
        )}

        <ChatRoomImage
          clickable={true}
          className="mr-3 h-10 w-10"
          profiles={otherHumans.map((p) => ({
            imageUrl: p.profileImage?.url,
            profileUrl: `/space/${spaceSlug}/profile/${p.profileId}`,
          }))}
        />

        <div>
          <ChatTitle chatRoom={chatRoom} />
          {chatHeadline && (
            <>
              <div></div>
              <Text
                variant="body2"
                className="text-gray-700"
                loading={!chatHeadline}
              >
                {chatHeadline}
              </Text>
            </>
          )}
        </div>
      </div>

      <RenderChatRoomMessages chatRoomId={chatRoomId ?? ""} />
      <div className="h-px w-full shrink-0 bg-gray-600"></div>

      <SendMessageInput className="m-4 ml-16" chatRoomId={chatRoomId ?? null} />
    </div>
  );
}
