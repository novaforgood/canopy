import React from "react";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";

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
  return (
    <button
      onClick={onClick}
      className=" border-gray-400 mb-10 border-x border-y rounded-md flex flex-col items-start transition hover:border-black active:translate-y-px"
    >
      <div className="w-full border-none pb-4">
        <img className="w-full rounded-t-md" src={imageUrl} alt={name} />
      </div>
      <div className="px-4 flex flex-col items-start">
        <div className="pb-2 pt-4 text-2xl font-semibold">{name}</div>
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
