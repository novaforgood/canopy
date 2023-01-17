import { useEffect } from "react";

import { useRouter } from "next/router";

import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { useAllChatRoomsSubscription } from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { CustomPage } from "../../../../types";

const ChatHomePage: CustomPage = () => {
  const router = useRouter();
  const spaceSlug = useQueryParam("slug", "string");

  const { currentProfile } = useCurrentProfile();

  const [{ data, fetching }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  useEffect(() => {
    if (fetching) return;
    if (!data) return;
    if (data.chat_room.length === 0) {
      router.push(`/space/${spaceSlug}/chat/new`);
    } else {
      router.push(`/space/${spaceSlug}/chat/${data.chat_room[0].id}`);
    }
  }, [data, fetching, router, spaceSlug]);

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm"></div>
    </div>
  );
};

ChatHomePage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};
export default ChatHomePage;
