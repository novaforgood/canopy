import React from "react";

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
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    subtitle,
    descriptionTitle,
    imageUrl,
    tags,
    onClick = () => {},
  } = props;

  const { ref, width } = useElementSize();

  const desiredHeight = width;

  return (
    <button
      onClick={onClick}
      className="bg-white border-gray-400 border-x border-y rounded-md flex flex-col items-start transition hover:border-green-500 active:translate-y-px"
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
        <div className="pb-2 pt-4 text-2xl text-left truncate w-full">
          {name}
        </div>
        <div className="mb-4 text-md pb-4">{subtitle ?? "‎"}</div>
        <div className="pb-2">
          <Text variant="body2" medium className="text-gray-800">
            {descriptionTitle}
          </Text>
        </div>
        <div className="mb-4 text-gray-500 text-ellipsis overflow-hidden flex flex-wrap gap-1">
          {tags && tags.length > 0 ? (
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
