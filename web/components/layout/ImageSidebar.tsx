import { useRouter } from "next/router";

import { BackButton } from "../BackButton";

interface ImageSidebarProps {
  imageSrc: string;
  imageAlt: string;
  canGoBack?: boolean;
}
export function ImageSidebar(props: ImageSidebarProps) {
  const { imageSrc, imageAlt, canGoBack } = props;

  const router = useRouter();
  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-8">
      <div className="w-full max-w-lg flex flex-col items-start">
        <img src={imageSrc} alt={imageAlt} className="shrink-0 w-full" />
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
