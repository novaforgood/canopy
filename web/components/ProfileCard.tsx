import React from "react";

import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { Arguments } from "@dnd-kit/sortable/dist/hooks/useSortable";
import { CSS } from "@dnd-kit/utilities";
import { useElementSize } from "@mantine/hooks";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";

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

  const { ref, width } = useElementSize();

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

  const desiredHeight = width;

  const numTags = 3;
  const processedTags = [
    ...tags.slice(0, numTags),
    `+ ${tags.length - numTags} more`,
  ];
  return (
    <button
      onClick={onClick}
      className="bg-white border-gray-400 border-x border-y rounded-md flex flex-col items-start transition hover:border-green-500"
      ref={setNodeRef}
      {...attributes}
      style={style}
    >
      <div className="w-full border-none pb-4">
        <div ref={ref} style={{ height: desiredHeight }}>
          <ProfileImage
            className="w-full h-full rounded-t-md"
            rounded={false}
            border={false}
            src={imageUrl}
            alt={name}
          />
        </div>
      </div>
      <div className="px-4 flex flex-col items-start w-full text-gray-900 ">
        <Text variant="heading4" className="text-left truncate w-full">
          {name}
        </Text>
        <div className="h-1"></div>
        {subtitle && (
          <>
            <Text variant="body2" className="text-left">
              {subtitle}
            </Text>
            <div className="h-4"></div>
          </>
        )}
        <Text variant="body2" medium className="text-gray-800">
          {descriptionTitle}
        </Text>
        <div className="h-2"></div>
        <div className="mb-4 text-gray-500 text-ellipsis overflow-hidden flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <Tag key={index} text={tag} variant="outline" />
            ))
          ) : (
            <Text italic>none</Text>
          )}
        </div>
      </div>
    </button>
  );
}
