import { useEffect } from "react";

import { useRouter } from "next/router";

import { Text } from "../../../../components/atomic";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { RenderChatRoom } from "../../../../components/chats/RenderChatRoom";
import { ProfileImage } from "../../../../components/ProfileImage";
import { useChatRoomQuery } from "../../../../generated/graphql";
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
