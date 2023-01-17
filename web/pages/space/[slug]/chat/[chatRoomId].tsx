import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { RenderChatRoom } from "../../../../components/chats/RenderChatRoom";
import { CustomPage } from "../../../../types";

const NewChatPage: CustomPage = () => {
  return (
    <>
      <RenderChatRoom />
    </>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};

export default NewChatPage;
