import React from "react";

import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Text } from "./atomic";
import { ProfileImage } from "./ProfileImage";
import { Tag } from "./Tag";

interface ProfileCardProps {
  imageUrl?: string;
  name: string;
  subtitle?: string | null;
  descriptionTitle: string;
  tags?: string[];
  onClick?: () => void;
  id: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    subtitle,
    descriptionTitle,
    imageUrl,
    tags = [],
    onClick = () => {},
    id,
  } = props;

  const { attributes, setNodeRef, transform, transition } = useSortable({
    id,
    animateLayoutChanges: (args) => {
      const { isSorting } = args;

      if (isSorting) {
        return defaultAnimateLayoutChanges(args);
      }

      return true;
    },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const numTags = 5;
  const remainingTags = tags.length - numTags;
  const processedTags = tags.slice(0, numTags);
  if (remainingTags > 0) {
    processedTags.push(`+${remainingTags} more…`);
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-md border-x border-y border-gray-400 bg-white transition hover:border-green-500"
      ref={setNodeRef}
      {...attributes}
      style={style}
    >
      <div className="w-full border-none pb-4">
        <ProfileImage
          className="h-full w-full rounded-t-md"
          rounded={false}
          border={false}
          src={imageUrl}
          alt={name}
        />
      </div>
      <div className="flex w-full flex-col items-start px-4 text-gray-900 ">
        <Text variant="heading4" className="w-full truncate text-left">
          {name}
        </Text>
        <div className="h-1"></div>
        {subtitle && (
          <>
            <Text variant="body2" className="text-left">
              {subtitle}
            </Text>
          </>
        )}
        <div className="h-4"></div>
        <Text variant="body2" medium className="text-gray-800">
          {descriptionTitle}
        </Text>
        <div className="h-1.5"></div>
        <div className="mb-4 flex w-full flex-wrap gap-1 overflow-hidden text-ellipsis text-left text-gray-500">
          {processedTags.length > 0 ? (
            processedTags.map((tag, index) => (
              <Tag
                key={index}
                text={tag}
                variant="outline"
                className="justify-self-stretch"
                style={{ maxWidth: "calc(50% - 0.125rem)" }}
              />
            ))
          ) : (
            <Text italic>none</Text>
          )}
        </div>
      </div>
    </button>
  );
}
