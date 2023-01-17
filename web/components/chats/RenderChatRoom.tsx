import { useCallback } from "react";

import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  Chat_Message,
  User_Type_Enum,
  useSendMessageMutation,
} from "../../generated/graphql";
import { BxChevronLeft, BxInfoCircle } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { Text } from "../atomic";
import { ProfileImage } from "../common/ProfileImage";
import { ActionModal } from "../modals/ActionModal";

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

  // Chat topbar
  const allHumans = getChatParticipants(
    chatRoom?.profile_to_chat_rooms ?? []
  ).filter((p) => p.userType === User_Type_Enum.User);
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
          <div className="mr-2">
            <ChatParticipantsModalButton chatParticipants={allHumans} />
          </div>
        </div>
      </div>

      <RenderChatRoomMessages chatRoomId={chatRoomId ?? ""} />
      <div className="h-px w-full shrink-0 bg-gray-600"></div>

      <SendMessageInput className="m-4 ml-16" chatRoomId={chatRoomId ?? null} />
    </div>
  );
}

interface ChatParticipantsModalButtonProps {
  chatParticipants: ChatParticipant[];
}
function ChatParticipantsModalButton(props: ChatParticipantsModalButtonProps) {
  const { chatParticipants } = props;

  const { currentProfile } = useCurrentProfile();
  const spaceSlug = useQueryParam("slug", "string");
  const [open, handlers] = useDisclosure(false);

  return (
    <>
      <BxInfoCircle
        className="h-5 w-5 cursor-pointer text-gray-500"
        onClick={handlers.open}
      />

      <ActionModal
        isOpen={open}
        onClose={handlers.close}
        actionText="Close"
        onAction={handlers.close}
      >
        <div className="flex flex-col rounded-md bg-white px-8 py-8">
          <div className="w-96"></div>
          <Text variant="subheading1" className="mx-auto">
            People in this chat
          </Text>
          <div className="h-8"></div>
          <div className="flex flex-col gap-3">
            {chatParticipants.map((p) => (
              <div
                className="flex items-center justify-between"
                key={p.profileId}
              >
                <div className="flex items-center gap-2">
                  <ProfileImage
                    className="h-10 w-10"
                    src={p.profileImage?.url}
                  />
                  <Text variant="body1">{p.fullName}</Text>
                </div>
                {p.profileId === currentProfile?.id ? (
                  <Text variant="body1" className="text-gray-500">
                    You
                  </Text>
                ) : (
                  <a
                    href={`/space/${spaceSlug}/profile/${p.profileId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Text className="text-gray-500 hover:underline">
                      View Profile
                    </Text>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </ActionModal>
    </>
  );
}
