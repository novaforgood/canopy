import classNames from "classnames";
import Link from "next/link";

import { ProfileImage } from "../common/ProfileImage";

interface ChatRoomImageProps {
  profiles: {
    imageUrl: string | undefined;
    profileUrl: string | undefined;
  }[];
  clickable?: boolean;
  className?: string;
}

export function ChatRoomImage(props: ChatRoomImageProps) {
  const { profiles, className, clickable } = props;

  // Move towards end if no image
  const sortedProfiles = profiles.sort((a, b) => {
    if (a.imageUrl && !b.imageUrl) {
      return -1;
    }
    if (!a.imageUrl && b.imageUrl) {
      return 1;
    }
    return 0;
  });

  if (sortedProfiles.length === 0) {
    return (
      <ProfileImage
        className={classNames("cursor-pointer", className)}
        src={undefined}
      />
    );
  }

  if (sortedProfiles.length === 1) {
    if (clickable) {
      return (
        <Link
          passHref
          href={clickable ? sortedProfiles[0].profileUrl ?? "" : ""}
        >
          <ProfileImage
            src={sortedProfiles[0].imageUrl}
            className={classNames("cursor-pointer", className)}
          />
        </Link>
      );
    } else {
      return (
        <ProfileImage
          src={sortedProfiles[0].imageUrl}
          className={classNames(className)}
        />
      );
    }
  }

  return (
    <div className={classNames("relative", className)}>
      <div className="absolute top-0 right-0 h-2/3 w-2/3">
        <ProfileImage
          src={sortedProfiles[1].imageUrl}
          className="h-full w-full"
        />
      </div>
      <div className="absolute bottom-0 left-0 h-2/3 w-2/3">
        <ProfileImage
          src={sortedProfiles[0].imageUrl}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
