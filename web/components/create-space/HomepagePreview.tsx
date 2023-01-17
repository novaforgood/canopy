import React from "react";

import classNames from "classnames";

import { BxCaretDown } from "../../generated/icons/regular";
import { Text } from "../atomic";
import { SpaceCoverPhoto } from "../common/SpaceCoverPhoto";
import { HtmlDisplay } from "../HtmlDisplay";

const SPACE_NAME_PLACEHOLDER = "Space Name";
const ARRAY_LENGTH_8 = new Array(8).fill(0);

interface HomepagePreviewProps {
  title: string;
  description: string;
  coverSrc: string | null;
  titleAndDescriptionFlashing?: boolean;
  coverFlashing?: boolean;
}

export function HomepagePreview(props: HomepagePreviewProps) {
  const {
    title,
    description,
    coverSrc,
    titleAndDescriptionFlashing = false,
    coverFlashing = false,
  } = props;

  const headingStyles = classNames({
    "p-2": true,
    "bg-green-50 animate-pulse": titleAndDescriptionFlashing,
  });
  const titleAndDescriptionStyles = classNames({
    "flex-1 flex flex-col items-start gap-2 p-2": true,
    "bg-green-50 animate-pulse": titleAndDescriptionFlashing,
  });

  const coverStyles = classNames({
    "flex-1 bg-gray-50": true,
    "bg-green-50 animate-pulse": coverFlashing,
  });

  return (
    <div className="mt-12 w-96 shrink-0 rounded-md border border-black p-4 2xl:w-120">
      <div className="flex items-center justify-between truncate">
        <Text variant="subheading1" className={headingStyles}>
          {title}
        </Text>
        <div className="flex items-center gap-1">
          <div className="h-5 w-5 rounded-full bg-gray-700"></div>
          <BxCaretDown className="h-5 w-5" />
        </div>
      </div>

      <div className="h-8"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className={titleAndDescriptionStyles}>
          <Text variant="heading4">{title}</Text>
          <HtmlDisplay html={description} className="text-xs" />
        </div>
        <SpaceCoverPhoto className={coverStyles} src={coverSrc} />
      </div>
      <div className="my-8 h-0.5 w-full bg-gray-50"></div>
      <div className="grid w-full grid-cols-4 gap-4">
        {ARRAY_LENGTH_8.map((_, idx) => {
          return (
            <div key={idx} className="h-24 rounded-md bg-gray-50 2xl:h-28" />
          );
        })}
      </div>
    </div>
  );
}
