import { ReactNode } from "react";

import classNames from "classnames";
import { format, formatDistanceStrict } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";

import { useAllChatRoomsQuery } from "../../generated/graphql";
import { BxMessageAdd } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { getTimeRelativeToNow } from "../../lib";
import { Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { SidePadding } from "../layout/SidePadding";
import { Navbar } from "../Navbar";
import { ProfileImage } from "../ProfileImage";

interface ChatLayoutProps {
  children?: ReactNode;
}

export function ChatLayout(props: ChatLayoutProps) {
  const { children } = props;

  const router = useRouter();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data }] = useAllChatRoomsQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

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
                const otherProfile = room.profile_to_chat_rooms[0].profile;

                const { first_name, last_name } = otherProfile.user;
                const image =
                  otherProfile.profile_listing?.profile_listing_image?.image;
                const latestMessage = room.chat_messages[0];

                const selected = router.query.chatRoomId === room.id;

                return (
                  <Link
                    key={room.id}
                    href={`/space/${currentSpace?.slug}/chat/${room.id}`}
                  >
                    <a
                      className={classNames({
                        "w-full rounded-md p-3 transition": true,
                        "pointer-events-none bg-gray-100": selected,
                        "hover:bg-gray-200": !selected,
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
                              className="truncate text-gray-800"
                              variant="body3"
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
                              {formatDistanceStrict(
                                new Date(latestMessage?.created_at ?? ""),
                                new Date()
                              )
                                .replace(" minutes", "m")
                                .replace(" hours", "h")
                                .replace(" days", "d")
                                .replace(" weeks", "w")}
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
