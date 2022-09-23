import { ReactNode } from "react";

import classNames from "classnames";
import { format, formatDistanceStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";

import { useAllChatRoomsSubscription } from "../../generated/graphql";
import { BxMessageAdd } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useQueryParam } from "../../hooks/useQueryParam";
import { getTimeRelativeToNow } from "../../lib";
import { Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
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

interface ChatLayoutProps {
  children?: ReactNode;
}

export function ChatLayout(props: ChatLayoutProps) {
  const { children } = props;

  const router = useRouter();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const chatRoomId = useQueryParam("chatRoomId", "string");

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-olive-100">
        <Navbar />
        <div className="sm:h-8"></div>
      </div>
      <SidePadding
        className="flex min-h-0 flex-1 flex-col items-center border-b border-gray-600 bg-olive-100 pb-8"
        innerClassName="h-full"
      >
        <div className="flex h-full items-start rounded-lg border border-olive-700 bg-white py-4">
          <div className="w-72 shrink-0">
            <div className="flex h-12 w-full items-center justify-between gap-8 px-4">
              <Text variant="heading4">Direct Messages</Text>
              <Link href={`/space/${currentSpace?.slug}/chat/new`} passHref>
                <a>
                  <IconButton
                    icon={<BxMessageAdd className="h-5 w-5" />}
                  ></IconButton>
                </a>
              </Link>
            </div>
            <div className="my-4 h-px w-full bg-olive-600"></div>
            <div className="flex flex-col p-4">
              {data?.chat_room.map((room) => {
                const otherProfileEntry = room.profile_to_chat_rooms.find(
                  (p) => p.profile.id !== currentProfile?.id
                );
                const myProfileEntry = room.profile_to_chat_rooms.find(
                  (p) => p.profile.id === currentProfile?.id
                );

                if (!otherProfileEntry || !myProfileEntry) {
                  return null;
                }

                const { first_name, last_name } =
                  otherProfileEntry.profile.user;
                const image =
                  otherProfileEntry.profile.profile_listing
                    ?.profile_listing_image?.image;
                const latestMessage = room.chat_messages[0];

                const selected = router.query.chatRoomId === room.id;

                const shouldNotHighlight =
                  // Latest message was sent by me
                  latestMessage.sender_profile_id ===
                    myProfileEntry.profile.id ||
                  // Currently viewing the chat room
                  room.id === chatRoomId ||
                  // Latest message sent by the other guy was read
                  (myProfileEntry.latest_read_chat_message_id &&
                    latestMessage.id <=
                      myProfileEntry.latest_read_chat_message_id);

                // console.log("-");
                // console.log(
                //   "Other profile entry",
                //   otherProfileEntry.profile.user.first_name
                // );
                // console.log(
                //   "latest",
                //   latestMessage.id,
                //   "latest read",
                //   myProfileEntry.latest_read_chat_message_id
                // );

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
                              {latestMessage?.sender_profile_id ===
                              currentProfile?.id
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
          <div className="h-full w-full self-stretch rounded-md border border-olive-600">
            {children}
          </div>
          <div className="w-8 shrink-0">
            <div className="h-12"></div>
            <div className="my-4 h-px w-full bg-olive-600"></div>
          </div>
        </div>
        <div className="h-16"></div>
      </SidePadding>
    </div>
  );
}
