import { useEffect } from "react";

import { useRouter } from "next/router";

import { Text } from "../../../../components/atomic";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { RenderChatRoom } from "../../../../components/chats/RenderChatRoom";
import { ProfileImage } from "../../../../components/ProfileImage";
import { useChatRoomSubscription } from "../../../../generated/graphql";
import { CustomPage } from "../../../../types";

const NewChatPage: CustomPage = () => {
  const router = useRouter();
  const chatRoomId = router.query.chatRoomId as string;

  const [{ data: chatRoomData }] = useChatRoomSubscription({
    variables: { chat_room_id: chatRoomId },
  });

  const chatRoom = chatRoomData?.chat_room_by_pk;
  return (
    <>
      {chatRoom && chatRoomId === chatRoom.id ? (
        <RenderChatRoom chatRoom={chatRoom} />
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-md">
          <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
            <ProfileImage className="h-10 w-10" />

            <Text>Loading...</Text>
          </div>
        </div>
      )}
    </>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};

export default NewChatPage;
