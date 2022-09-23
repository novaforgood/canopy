import { useRouter } from "next/router";

import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { RenderChatRoom } from "../../../../components/chats/RenderChatRoom";
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
      {chatRoom ? <RenderChatRoom chatRoom={chatRoom} /> : <div>Loading</div>}
    </>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};

export default NewChatPage;
