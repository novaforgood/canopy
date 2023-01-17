import { ReactNode, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { Button, Text } from "../../../../components/atomic";
import { Dropdown } from "../../../../components/atomic/Dropdown";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import {
  ProfileMultiSelect,
  SelectedProfile,
} from "../../../../components/chats/ProfileMultiSelect";
import { RenderChatRoomMessages } from "../../../../components/chats/RenderChatRoomMessages";
import { SendMessageInput } from "../../../../components/chats/SendMessageInput";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { LoadingSpinner } from "../../../../components/LoadingSpinner";
import { Navbar } from "../../../../components/navbar/Navbar";
import { SpaceSplashPage } from "../../../../components/space-homepage/SpaceSplashPage";
import { useFindChatRoomsQuery } from "../../../../generated/graphql";
import {
  BxChevronLeft,
  BxMessageDetail,
} from "../../../../generated/icons/regular";
import { useMediaQuery } from "../../../../hooks/useMediaQuery";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { CustomPage } from "../../../../types";

const NewChatPage: CustomPage = () => {
  const router = useRouter();
  const spaceSlug = useQueryParam("slug", "string");
  const baseRoute = `/space/${spaceSlug}/chat`;
  const renderDesktopMode = useMediaQuery({
    showIfBiggerThan: "md",
  });

  const [selectedProfiles, setSelectedProfiles] = useState<SelectedProfile[]>(
    []
  );

  const [{ data: findChatRoomsData, fetching: fetchingChatRooms }] =
    useFindChatRoomsQuery({
      variables: {
        where: {
          profile_to_chat_rooms: {
            _and: selectedProfiles.map((profile) => ({
              profile_id: {
                _eq: profile.profileId,
              },
            })),
          },
          profile_to_chat_rooms_aggregate: {
            count: {
              predicate: {
                _eq: selectedProfiles.length + 1,
              },
            },
          },
        },
      },
    });

  const suggestedChatRoom = useMemo(() => {
    if (!findChatRoomsData || findChatRoomsData.chat_room.length === 0)
      return null;
    return findChatRoomsData.chat_room[0];
  }, [findChatRoomsData]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
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
        {/* <Text>Connect with someone new</Text> */}
        <div className="flex items-center gap-2">
          <Text>To:</Text>
          <ProfileMultiSelect
            selectedProfiles={selectedProfiles}
            onChange={setSelectedProfiles}
          />
        </div>
      </div>

      {fetchingChatRooms ? (
        <div className="mx-auto mt-24 flex max-w-xs flex-col items-center">
          <div className="flex items-center">
            <LoadingSpinner className="mr-1.5" />
            <Text className="text-gray-700">Loading...</Text>
          </div>
        </div>
      ) : suggestedChatRoom ? (
        <>
          <RenderChatRoomMessages chatRoomId={suggestedChatRoom.id} />
          <div className="h-px w-full shrink-0 bg-gray-600"></div>
          <SendMessageInput
            className="m-4 ml-16"
            chatRoomId={suggestedChatRoom.id}
          />
        </>
      ) : selectedProfiles.length === 0 ? (
        <div className="mx-auto mt-24 flex max-w-xs flex-col items-center">
          {/* <div className="flex items-center gap-4">
            <BxMessageDetail className="h-10 w-10" />
            <Text variant="subheading1" className="mb-1">
              Connect with someone
            </Text>
          </div>
          <div className="h-8"></div>
          <Text className=" text-center text-gray-700">
            Browse the community directory and click a profile to start
            chatting.
          </Text>
          <div className="h-4"></div>
          <a href={`/space/${spaceSlug}`}>
            <Button rounded>Browse Profiles</Button>
          </a> */}
        </div>
      ) : (
        <>
          <div className="flex-1"></div>
          <SendMessageInput chatRoomId={null} />
        </>
      )}
    </div>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};
export default NewChatPage;
