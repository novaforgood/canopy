import { ReactNode } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { Button, Text } from "../../../../components/atomic";
import { ChatLayout } from "../../../../components/chats/ChatLayout";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/Navbar";
import { SpaceSplashPage } from "../../../../components/space-homepage/SpaceSplashPage";
import {
  BxMessage,
  BxMessageAlt,
  BxMessageDetail,
} from "../../../../generated/icons/regular";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { CustomPage } from "../../../../types";

const NewChatPage: CustomPage = () => {
  const router = useRouter();
  const spaceSlug = useQueryParam("slug", "string");

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex h-16 shrink-0 items-center gap-3 bg-olive-50 px-4 shadow-sm">
        <Text>Connect with someone new</Text>
      </div>

      <div className="mx-auto mt-24 flex max-w-xs flex-col items-center">
        <div className="flex items-center gap-4">
          <BxMessageDetail className="h-10 w-10" />
          <Text variant="subheading1" className="mb-1">
            Connect with someone
          </Text>
        </div>
        <div className="h-8"></div>
        <Text className=" text-center text-gray-700">
          Browse the community directory and click a profile to start chatting.
        </Text>
        <div className="h-4"></div>
        <a href={`/space/${spaceSlug}`}>
          <Button rounded>Browse Profiles</Button>
        </a>
      </div>
    </div>
  );
};

NewChatPage.getLayout = (page) => {
  return <ChatLayout>{page}</ChatLayout>;
};
export default NewChatPage;
