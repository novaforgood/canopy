import { ReactNode } from "react";

import { useRouter } from "next/router";

import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { SidePadding } from "../layout/SidePadding";
import { Navbar } from "../navbar/Navbar";

import { ChatRoomList } from "./ChatRoomList";

interface DesktopChatLayoutProps {
  children?: ReactNode;
}

function DesktopChatLayout(props: DesktopChatLayoutProps) {
  const { children } = props;

  return (
    <SidePadding
      className="flex min-h-0 flex-1 flex-col items-center border-b border-gray-600 bg-olive-100 pb-8"
      innerClassName="h-full"
    >
      <div className="flex h-full w-full items-start rounded-lg border border-olive-700 bg-white py-4 pt-6">
        <div className="h-full w-72 shrink-0">
          <ChatRoomList />
        </div>
        <div className="h-full min-w-0 flex-1 overflow-hidden rounded-md border border-olive-600">
          {children}
        </div>
        <div className="w-8 shrink-0">
          <div className="h-14"></div>
          <div className="h-px w-full bg-olive-600"></div>
        </div>
      </div>
      <div className="h-16"></div>
    </SidePadding>
  );
}

interface MobileChatLayoutProps {
  children?: ReactNode;
}

function MobileChatLayout(props: MobileChatLayoutProps) {
  const { children } = props;

  const router = useRouter();
  const chatRoomId = useQueryParam("chatRoomId", "string");

  const isNewChatPage = router.route === "/space/[slug]/chat/new";

  return (
    <div className="h-full">
      {isNewChatPage ? children : chatRoomId ? children : <ChatRoomList />}
    </div>
  );
}
interface ChatLayoutProps {
  children?: ReactNode;
}

export function ChatLayout(props: ChatLayoutProps) {
  const { children } = props;

  const renderDesktopMode = useMediaQuery({
    showIfBiggerThan: "md",
  });
  return (
    <>
      <div className="relative flex h-[calc(100dvh)] flex-col">
        <div className="bg-olive-100">
          <Navbar />
          <div className="sm:h-8"></div>
        </div>

        {renderDesktopMode && <DesktopChatLayout>{children}</DesktopChatLayout>}
        {!renderDesktopMode && <MobileChatLayout>{children}</MobileChatLayout>}
      </div>
    </>
  );
}
