import React, { ReactNode } from "react";

import { useDisclosure, useSetState } from "@mantine/hooks";
import toast from "react-hot-toast";

import { Button, Input, Text } from "../../components/atomic";
import { ActionModal } from "../../components/modals/ActionModal";
import {
  Profile_Listing_Constraint,
  Profile_Listing_Social_Type_Enum as SocialEnum,
  Profile_Listing_Update_Column,
  useProfileListingSocialsQuery,
  useUpdateListingSocialsMutation,
} from "../../generated/graphql";
import {
  BxlInstagram,
  BxlLinkedin,
  BxlTwitter,
} from "../../generated/icons/logos";
import { BxsEnvelope } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";

const ALL_SOCIAL_TYPES = Object.values(SocialEnum);

type SocialProperties = {
  icon: ReactNode;
  label: string;
  placeholder: string;
};
const MAP_SOCIAL_TYPE_TO_PROPERTIES: Record<SocialEnum, SocialProperties> = {
  [SocialEnum.Twitter]: {
    icon: <BxlTwitter />,
    label: "Twitter",
    placeholder: "Twitter username",
  },
  [SocialEnum.Instagram]: {
    icon: <BxlInstagram />,
    label: "Instagram",
    placeholder: "Instagram username",
  },
  [SocialEnum.LinkedIn]: {
    icon: <BxlLinkedin />,
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
  },
};

export function ProfileSocialsInput() {
  console.log(ALL_SOCIAL_TYPES);
  const { userData } = useUserData();

  const { currentProfile } = useCurrentProfile();
  const [{ data: profileListingSocialsData }, refetch] =
    useProfileListingSocialsQuery({
      variables: {
        profile_listing_id: currentProfile?.profile_listing?.id ?? "",
      },
    });

  const [socials, setSocials] = useSetState<Record<string, string>>({});

  const [opened, handlers] = useDisclosure(false, {
    onOpen: () => {
      // Set socials based on data
      if (profileListingSocialsData?.profile_listing_social) {
        const socials = profileListingSocialsData.profile_listing_social.reduce(
          (acc, curr) => {
            acc[curr.type] = curr.link;
            return acc;
          },
          {} as Record<string, string>
        );
        setSocials(socials);
      }
    },
  });

  const [_, updateSocials] = useUpdateListingSocialsMutation();

  const handleSaveSocials = async () => {
    if (!currentProfile) {
      toast.error("No currentProfile");
      return;
    }
    const profileListingSocials = ALL_SOCIAL_TYPES.map((type) => {
      return {
        type,
        link: socials[type],
      };
    }).filter((s) => s.link);

    await updateSocials({
      profile_id: currentProfile.id,
      profile_listing_social: profileListingSocials.map((s) => ({
        ...s,
        profile_listing: {
          data: {
            profile_id: currentProfile.id,
          },
          on_conflict: {
            constraint: Profile_Listing_Constraint.ProfileListingProfileIdKey,
            update_columns: [Profile_Listing_Update_Column.ProfileId],
          },
        },
      })),
    });
    refetch();

    handlers.close();
  };

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-4">
          <Text className="text-right w-24">Email</Text>
          <Text className="py-1 px-4 border rounded-md">
            {userData?.email ?? ""}
          </Text>
        </div>
        {profileListingSocialsData?.profile_listing_social?.map(
          (profileListingSocial) => {
            const { type, link } = profileListingSocial;
            const { icon, label, placeholder } =
              MAP_SOCIAL_TYPE_TO_PROPERTIES[type];
            return (
              <div key={type} className="flex items-center gap-4">
                <Text className="text-right w-24">{label}</Text>
                <Text className="py-1 px-4 border rounded-md">{link}</Text>
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
          Edit
        </Button>

        <ActionModal
          isOpen={opened}
          onClose={() => {
            handlers.close();
          }}
          actionText="Save"
          onAction={handleSaveSocials}
          secondaryActionText="Cancel"
          onSecondaryAction={async () => {
            handlers.close();
          }}
        >
          <div className="flex flex-col gap-2 p-8 w-120">
            <div className="flex items-center gap-4">
              <BxsEnvelope />
              <Input
                disabled
                value={userData?.email}
                className="w-full"
              ></Input>
            </div>

            {ALL_SOCIAL_TYPES.map((socialType, idx) => {
              const properties = MAP_SOCIAL_TYPE_TO_PROPERTIES[socialType];

              return (
                <div className="flex items-center gap-4" key={idx}>
                  {properties.icon}
                  <Input
                    placeholder={properties.placeholder}
                    className="w-full"
                    value={socials[socialType] ?? ""}
                    onValueChange={(newValue) => {
                      setSocials({
                        [socialType]: newValue,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </ActionModal>
      </div>
    </>
  );
}
