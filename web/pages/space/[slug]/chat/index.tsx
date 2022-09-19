import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { CustomPage } from "../../../../types";

const NewChatPage: CustomPage = () => {
  return (
    <div>
      <div>lmao</div>
    </div>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};

export default NewChatPage;
