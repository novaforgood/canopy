import { Linking, TouchableOpacity } from "react-native";

import { useProfileListingSocialsQuery } from "../../generated/graphql";
import { BxsEnvelope } from "../../generated/icons/solid";
import { Box } from "../atomic/Box";

import { MAP_SOCIAL_TYPE_TO_PROPERTIES } from "./constants";

function IconLink(props: {
  href: string;
  icon: (props: { color: string }) => JSX.Element;
}) {
  const { href, icon } = props;

  const Icon = icon;
  return (
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(href);
      }}
    >
      <Box
        mr={2}
        height={40}
        width={40}
        p={1.5}
        borderRadius="full"
        borderWidth={1}
        borderColor="green700"
      >
        <Icon color="green700" />
      </Box>
    </TouchableOpacity>
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

  return (
    <>
      <Box flexDirection="row" flexWrap="wrap" alignItems="flex-start">
        {email && <IconLink icon={BxsEnvelope} href={`mailto:${email}`} />}
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
      </Box>
    </>
  );
}
