import { ReactNode } from "react";

import classNames from "classnames";
import { format, formatDistanceStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";

import { useAllChatRoomsSubscription } from "../../generated/graphql";
import { BxMessageAdd } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { getTimeRelativeToNow } from "../../lib";
import { Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { Responsive } from "../layout/Responsive";
import { SidePadding } from "../layout/SidePadding";
import { Navbar } from "../Navbar";
import { ProfileImage } from "../ProfileImage";

function formatTimeSuperConcise(date: Date): string {
  const formatString = formatDistanceStrict(date, new Date())
    .replace(" minutes", "m")
    .replace(" hours", "h")
    .replace(" days", "d")
    .replace(" weeks", "w");

  if (formatString.includes("seconds")) {
    return "1m";
  } else {
    return formatString;
  }
}

export function ChatRoomList() {
  const router = useRouter();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data, fetching }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const chatRoomId = useQueryParam("chatRoomId", "string");

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
            <Text variant="body1">Loading...</Text>
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
                  <ProfileImage src={image?.url} className="h-10 w-10" />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Text>
                      {first_name} {last_name}
                    </Text>
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
