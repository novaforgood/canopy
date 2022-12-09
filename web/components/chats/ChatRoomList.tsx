import { useCallback, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { formatDistanceStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  AllChatRoomsSubscription,
  useAllChatRoomsSubscription,
  User_Type_Enum,
} from "../../generated/graphql";
import { BxMessageAdd } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useQueryParam } from "../../hooks/useQueryParam";
import { Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../ProfileImage";

import { ChatRoomImage } from "./ChatRoomImage";

type ProfileToChatRoom = NonNullable<
  AllChatRoomsSubscription["chat_room"][number]
>["profile_to_chat_rooms"][number];

export function getOtherHumanChatParticipants(
  ptcrs: ProfileToChatRoom[],
  currentProfileId: string
) {
  return ptcrs
    .filter(
      (ptcr) =>
        ptcr.profile.user.type === User_Type_Enum.User &&
        ptcr.profile.id !== currentProfileId
    )
    .map((ptcr) => ({
      fullName: `${ptcr.profile.user.first_name} ${ptcr.profile.user.last_name}`,
      firstName: ptcr.profile.user.first_name,
      lastName: ptcr.profile.user.last_name,
      headline: ptcr.profile.profile_listing?.headline,
      profileImage: ptcr.profile.profile_listing?.profile_listing_image?.image,
      profileId: ptcr.profile.id,
    }));
}

function useTimeFormatter() {
  const [timeNow, setTimeNow] = useState(new Date());

  // Update timenow every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatTimeSuperConcise = useCallback(
    (date: Date) => {
      const formatString = formatDistanceStrict(date, timeNow)
        .replace(" minutes", "m")
        .replace(" hours", "h")
        .replace(" days", "d")
        .replace(" weeks", "w");

      if (formatString.includes("second")) {
        return "<1m";
      } else {
        return formatString;
      }
    },
    [timeNow]
  );

  return useMemo(
    () => ({
      formatTimeSuperConcise,
    }),
    [formatTimeSuperConcise]
  );
}

export function ChatRoomList() {
  const router = useRouter();

  const { formatTimeSuperConcise } = useTimeFormatter();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data, fetching }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const chatRoomId = useQueryParam("chatRoomId", "string");
  const spaceSlug = useQueryParam("slug", "string");

  const chatRooms = data?.chat_room ?? [];

  return (
    <div className="flex h-full w-full shrink-0 flex-col overflow-hidden">
      <div className="bg-olive-50  md:bg-white">
        <div className="h-4 md:hidden"></div>
        <div className="flex h-12 w-full items-center justify-between gap-8 px-4 ">
          <Text variant="heading4">Direct Messages</Text>
          <Link href={`/space/${currentSpace?.slug}/chat/new`} passHref>
            <a>
              <IconButton
                icon={<BxMessageAdd className="h-5 w-5" />}
              ></IconButton>
            </a>
          </Link>
        </div>
        <div className="shrink=0 h-4"></div>
      </div>
      <div className="h-px w-full bg-olive-600"></div>
      <div className="flex h-full flex-col overflow-hidden overflow-y-scroll pt-2 md:p-2">
        {fetching && (
          <div className="ml-4 md:ml-0">
            <Text variant="body1" loading={true} loadingWidthClassName="w-32">
              Loading...
            </Text>
          </div>
        )}
        {chatRooms.map((room) => {
          const otherProfileEntry = room.profile_to_chat_rooms.find(
            (p) => p.profile.id !== currentProfile?.id
          );
          const myProfileEntry = room.profile_to_chat_rooms.find(
            (p) => p.profile.id === currentProfile?.id
          );

          if (!otherProfileEntry || !myProfileEntry) {
            return null;
          }

          const otherHumans = getOtherHumanChatParticipants(
            room.profile_to_chat_rooms,
            currentProfile?.id ?? ""
          );

          const chatTitle = otherHumans.map((h) => h.fullName).join(", ");

          const { first_name, last_name } = otherProfileEntry.profile.user;
          const image =
            otherProfileEntry.profile.profile_listing?.profile_listing_image
              ?.image;
          const latestMessage = room.chat_messages[0];

          const selected = router.query.chatRoomId === room.id;

          const shouldNotHighlight =
            // Latest message was sent by me
            latestMessage.sender_profile_id === myProfileEntry.profile.id ||
            // Currently viewing the chat room
            room.id === chatRoomId ||
            // Latest message sent by the other guy was read
            (myProfileEntry.latest_read_chat_message_id &&
              latestMessage.id <= myProfileEntry.latest_read_chat_message_id);

          return (
            <Link
              key={room.id}
              href={`/space/${currentSpace?.slug}/chat/${room.id}`}
            >
              <a
                className={classNames({
                  "w-full rounded-md p-3 transition": true,
                  "pointer-events-none bg-gray-100": selected,
                  "hover:bg-gray-100": !selected,
                })}
              >
                <div className="flex w-full items-center gap-4">
                  <ChatRoomImage
                    className="h-11 w-11"
                    profiles={otherHumans.map((p) => ({
                      imageUrl: p.profileImage?.url,
                      profileUrl: `/space/${spaceSlug}/profile/${p.profileId}`,
                    }))}
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Text>{chatTitle}</Text>
                    <div className="flex w-full items-center">
                      <Text
                        className={classNames({
                          truncate: true,
                          "text-gray-800": shouldNotHighlight,
                        })}
                        variant="body3"
                        bold={!shouldNotHighlight}
                      >
                        {latestMessage?.sender_profile_id === currentProfile?.id
                          ? "You: "
                          : ""}
                        {latestMessage?.text}
                      </Text>
                      <div className="mx-1.5 h-[3px] w-[3px] rounded-full bg-gray-700"></div>
                      <Text
                        variant="body3"
                        className="shrink-0 whitespace-nowrap text-right text-gray-500"
                      >
                        {formatTimeSuperConcise(
                          new Date(latestMessage?.created_at ?? "")
                        )}
                      </Text>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
