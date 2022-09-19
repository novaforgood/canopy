import { CustomPage } from "../../../../types";
import { ChatLayout } from "../../../../components/chats/ChatLayout";

type Shit = {
  shitter: string;
};

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
