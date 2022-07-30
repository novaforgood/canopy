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
      className="w-10 h-10 p-1.5 flex-none hover:bg-gray-100 transition rounded-full border border-green-700 text-green-700"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
}

interface ProfileSocialsDisplayProps {
  profileListingId: string;
  email?: string;
}

export function ProfileSocialsDisplay(props: ProfileSocialsDisplayProps) {
  const { profileListingId, email } = props;

  const [{ data: profileListingSocialsData }] = useProfileListingSocialsQuery({
    variables: {
      profile_listing_id: profileListingId,
    },
  });

  const [opened, handlers] = useDisclosure(false);

  return (
    <>
      <div className="flex flex-wrap items-start gap-3">
        {email && <IconLink icon={<BxsEnvelope />} href={`mailto:${email}`} />}
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
