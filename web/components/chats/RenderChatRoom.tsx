import { useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { makeListSentence } from "../../common/lib/words";
import {
  Chat_Message,
  useDeletePtcrMutation,
  User_Type_Enum,
  useSendMessageMutation,
} from "../../generated/graphql";
import {
  BxChevronLeft,
  BxDotsHorizontalRounded,
  BxExit,
} from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { getFirstNameOfUser } from "../../lib/user";
import { Text } from "../atomic";
import { Dropdown } from "../atomic/Dropdown";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../common/ProfileImage";

import { ChatParticipantsModalButton } from "./ChatParticipantsModalButton";
import { ChatRoomImage } from "./ChatRoomImage";
import { ChatTitle } from "./ChatTitle";
import { RenderChatRoomMessages } from "./RenderChatRoomMessages";
import { SendMessageInput } from "./SendMessageInput";
import { useChatRoom } from "./useChatRoom";
import {
  getChatRoomSubtitle,
  getChatParticipants,
  ChatParticipant,
} from "./utils";

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

  const [_, deletePtcr] = useDeletePtcrMutation();

  // Chat topbar
  const allHumans = getChatParticipants(
    chatRoom?.profile_to_chat_rooms ?? []
  ).filter((p) => p.userType !== User_Type_Enum.Bot);
  const otherHumans = allHumans.filter(
    (p) => p.profileId !== currentProfile?.id
  );

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

  const chatRoomSubtitle = getChatRoomSubtitle(
    chatRoom,
    currentProfile?.id ?? ""
  );

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

        <div className="flex w-full items-center justify-between">
          <div className="flex-1">
            <ChatTitle chatRoom={chatRoom} />
            {chatRoomSubtitle && (
              <>
                <div></div>
                <Text
                  variant="body2"
                  className="text-gray-700"
                  loading={!chatRoomSubtitle}
                >
                  {chatRoomSubtitle}
                </Text>
              </>
            )}
          </div>
          <div className="mr-2 flex">
            <ChatParticipantsModalButton chatParticipants={allHumans} />
            {chatRoom.chat_intro_id && (
              <Dropdown
                renderButton={() => {
                  return (
                    <IconButton
                      icon={
                        <BxDotsHorizontalRounded className="h-5 w-5 cursor-pointer text-gray-500" />
                      }
                    />
                  );
                }}
                items={[
                  {
                    label: "Leave chat",
                    onClick: () => {
                      const confirm = window.confirm(
                        "Are you sure you want to leave this chat? You will no longer be able to see it in your chat list."
                      );
                      if (!confirm) return;

                      const myPtcr = allHumans.find(
                        (p) => p.profileId === currentProfile?.id
                      );
                      if (!myPtcr) return;

                      const ptcrId = myPtcr.id;
                      deletePtcr({
                        id: ptcrId,
                      }).then(() => {
                        // Redirect to chat list
                        router.push(baseRoute);
                      });
                    },
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <RenderChatRoomMessages chatRoomId={chatRoomId ?? ""} />

      <div className="h-px w-full shrink-0 bg-gray-600"></div>

      <SendMessageInput className="m-4 ml-16" chatRoomId={chatRoomId ?? null} />
    </div>
  );
}
