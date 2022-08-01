import React from "react";

import { useDisclosure } from "@mantine/hooks";

import { useProfileListingSocialsQuery } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { Button, Text } from "../atomic";
import { TextInput } from "../inputs/TextInput";

import { MAP_SOCIAL_TYPE_TO_PROPERTIES } from "./constants";
import { ProfileSocialsModal } from "./ProfileSocialsModal";

export function EditProfileSocials() {
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
      <div className="flex flex-col items-start gap-2 w-full sm:w-120">
        <div className="flex items-center gap-4 w-full">
          <Text className="text-right w-24 flex-none">Email</Text>

          <TextInput
            className="w-full"
            value={userData?.email ?? ""}
            contentEditable={false}
          />
        </div>
        {profileListingSocialsData?.profile_listing_social?.map(
          (profileListingSocial) => {
            const { type, link } = profileListingSocial;
            const { icon, label, placeholder, renderPrefix } =
              MAP_SOCIAL_TYPE_TO_PROPERTIES[type];
            return (
              <div key={type} className="flex items-center gap-4 w-full">
                <Text className="text-right w-24 flex-none">{label}</Text>
                <TextInput
                  renderPrefix={renderPrefix}
                  placeholder={placeholder}
                  className="w-full"
                  value={link}
                  disabled
                />
              </div>
            );
          }
        )}
        <div className="h-4"></div>
        <Button
          onClick={() => {
            handlers.open();
          }}
        >
          Edit or add socials
        </Button>

        <ProfileSocialsModal isOpen={opened} onClose={handlers.close} />
      </div>
    </>
  );
}
