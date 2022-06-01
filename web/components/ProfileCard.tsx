import React from "react";

import { useElementSize } from "@mantine/hooks";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";

import { ProfileImage } from "./ProfileImage";

interface ProfileCardProps {
  imageUrl?: string;
  name: string;
  subtitle: string;
  descriptionTitle: string;
  description: string;
  onClick?: () => void;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    subtitle,
    description,
    descriptionTitle,
    imageUrl,
    onClick = () => {},
  } = props;

  const { ref, width } = useElementSize();

  const desiredHeight = width;

  return (
    <button
      onClick={onClick}
      className=" border-gray-400 mb-10 border-x border-y rounded-md flex flex-col items-start transition hover:border-black active:translate-y-px"
    >
      <div className="w-full border-none pb-4">
        <div ref={ref} style={{ height: desiredHeight }}>
          <ProfileImage
            className="w-full h-full rounded-t-md"
            rounded={false}
            src={imageUrl}
            alt={name}
          />
        </div>
      </div>
      <div className="px-4 flex flex-col items-start w-full">
        <div className="pb-2 pt-4 text-2xl font-semibold text-left truncate w-full">
          {name}
        </div>
        <div className="mb-4 text-md pb-4">{subtitle}</div>
        <div className="pb-2">
          <i>{descriptionTitle}</i>
        </div>
        <div className="mb-4 text-gray-500 text-ellipsis overflow-hidden">
          {description}
        </div>
      </div>
    </button>
  );
}
