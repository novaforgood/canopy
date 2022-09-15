import { useRouter } from "next/router";
import { ReactNode } from "react";

import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/Navbar";
import { SpaceSplashPage } from "../../../../components/space-homepage/SpaceSplashPage";
import { CustomPage } from "../../../../types";
import { ChatLayout } from "../../../../components/chats/ChatLayout";

const NewChatPage: CustomPage = () => {
  return <div>Lmao</div>;
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};
export default NewChatPage;
