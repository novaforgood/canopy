import React, { ReactNode } from "react";

import { useDisclosure } from "@mantine/hooks";

import { useProfileListingSocialsQuery } from "../../generated/graphql";
import { BxsEnvelope } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { Text } from "../atomic";
import { TextInput } from "../inputs/TextInput";

import { MAP_SOCIAL_TYPE_TO_PROPERTIES } from "./constants";

function IconLink(props: {
  className?: string;
  href: string;
  icon: ReactNode;
}) {
  const { className, href, icon } = props;
  return (
    <a
      className="w-10 h-10 p-2 flex-none bg-gray-500 hover:bg-gray-400 transition rounded-full text-gray-50"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
}

export function ProfileSocialsDisplay() {
  const { userData } = useUserData();

  const { currentProfile } = useCurrentProfile();
  const [{ data: profileListingSocialsData }] = useProfileListingSocialsQuery({
    variables: {
      profile_listing_id: currentProfile?.profile_listing?.id ?? "",
    },
  });

  const [opened, handlers] = useDisclosure(false);

  return (
    <>
      <div className="flex flex-wrap items-start gap-2">
        <IconLink icon={<BxsEnvelope />} href={`mailto:${userData?.email}`} />
        {profileListingSocialsData?.profile_listing_social?.map(
          (profileListingSocial) => {
            const { type, link } = profileListingSocial;
            const { icon, getLink } = MAP_SOCIAL_TYPE_TO_PROPERTIES[type];

            const realLink = getLink ? getLink(link) : link;
            return (
              <IconLink
                key={profileListingSocial.id}
                href={realLink}
                icon={icon}
              />
            );
          }
        )}
      </div>
    </>
  );
}
