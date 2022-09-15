import { ReactNode } from "react";
import { Text } from "../atomic";
import { BxMessageAdd } from "../../generated/icons/regular";
import { SidePadding } from "../layout/SidePadding";
import { Navbar } from "../Navbar";
import { useAllChatRoomsQuery } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { ProfileImage } from "../ProfileImage";
import { format } from "date-fns";
import { getTimeRelativeToNow } from "../../lib";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

interface ChatLayoutProps {
  children?: ReactNode;
}

export function ChatLayout(props: ChatLayoutProps) {
  const { children } = props;

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data }] = useAllChatRoomsQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  return (
    <div className="">
      <div className="bg-olive-100">
        <Navbar />
      </div>
      <SidePadding className="flex min-h-screen flex-col items-center border-b border-gray-600 bg-olive-100">
        <div className="sm:h-16"></div>
        <div className="flex items-start rounded-lg border border-olive-700 bg-white py-4">
          <div className="shrink-0">
            <div className="flex h-12 w-96 items-center justify-between gap-8 px-4">
              <Text variant="heading4">Direct Messages</Text>
              <button>
                <BxMessageAdd className="h-6 w-6" />
              </button>
            </div>
            <div className="my-4 h-px w-full bg-olive-600"></div>
            <div className="flex flex-col gap-2 p-4">
              {data?.chat_room.map((room) => {
                const otherProfile = room.profile_to_chat_rooms[0].profile;

                const { first_name, last_name } = otherProfile.user;
                const image =
                  otherProfile.profile_listing?.profile_listing_image?.image;
                const latestMessage = room.chat_messages[0];

                const selected = false;

                return (
                  <a
                    key={room.id}
                    className="rounded-md bg-gray-50 p-2"
                    href={`/space/${currentSpace?.slug}/chat/${room.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <ProfileImage src={image?.url} className="h-8 w-8" />

                      <div className="flex flex-1 flex-col">
                        <Text>
                          {first_name} {last_name}
                        </Text>
                        <span>
                          <Text className="text-gray-700" variant="body3">
                            {latestMessage?.text}{" "}
                          </Text>
                          <Text variant="body3">
                            {getTimeRelativeToNow(
                              new Date(latestMessage?.created_at ?? "")
                            )}
                          </Text>
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="w-full self-stretch rounded-md border border-olive-600">
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
