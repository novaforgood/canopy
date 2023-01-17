import { useRouter } from "next/router";

import { BackButton } from "../common/BackButton";

interface ImageSidebarProps {
  imageSrc: string;
  imageAlt: string;
  canGoBack?: boolean;
}
export function ImageSidebar(props: ImageSidebarProps) {
  const { imageSrc, imageAlt, canGoBack } = props;

  const router = useRouter();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8">
      <div className="flex w-full max-w-lg flex-col items-start">
        <img src={imageSrc} alt={imageAlt} className="w-full shrink-0" />
        {canGoBack && (
          <>
            <div className="h-16"></div>
            <BackButton />
          </>
        )}
      </div>
    </div>
  );
}
