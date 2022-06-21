import React from "react";

import classNames from "classnames";

import { BxCaretDown } from "../../generated/icons/regular";
import { Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

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
    "bg-teal-50 animate-pulse": titleAndDescriptionFlashing,
  });
  const titleAndDescriptionStyles = classNames({
    "flex-1 flex flex-col items-start gap-2 p-2": true,
    "bg-teal-50 animate-pulse": titleAndDescriptionFlashing,
  });

  const coverStyles = classNames({
    "flex-1 bg-gray-50": true,
    "bg-teal-50 animate-pulse": coverFlashing,
  });

  return (
    <div className="border border-black rounded-md p-4 w-96 2xl:w-120 mt-12 shrink-0">
      <div className="flex items-center justify-between truncate">
        <Text variant="subheading1" className={headingStyles}>
          {title}
        </Text>
        <div className="flex gap-1 items-center">
          <div className="rounded-full bg-gray-700 h-5 w-5"></div>
          <BxCaretDown className="h-5 w-5" />
        </div>
      </div>

      <div className="h-8"></div>
      <div className="flex w-full items-center gap-4">
        <div className={titleAndDescriptionStyles}>
          <Text variant="heading4">{title}</Text>
          <HtmlDisplay html={description} className="text-xs" />
        </div>
        <SpaceCoverPhoto className={coverStyles} src={coverSrc} />
      </div>
      <div className="w-full h-0.5 bg-gray-50 my-8"></div>
      <div className="grid grid-cols-4 gap-4 w-full">
        {ARRAY_LENGTH_8.map((_, idx) => {
          return (
            <div key={idx} className="rounded-md bg-gray-50 h-24 2xl:h-28" />
          );
        })}
      </div>
    </div>
  );
}
