import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Social_Type_Enum as SocialEnum,
  Profile_Listing_Update_Column,
  useProfileListingSocialsQuery,
  useUpdateListingSocialsMutation,
} from "../../generated/graphql";
import { BxsEnvelope } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { Input } from "../atomic";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

import { MAP_SOCIAL_TYPE_TO_PROPERTIES } from "./constants";

const ALL_SOCIAL_TYPES = Object.values(SocialEnum);

interface ProfileSocialsModalProps {
  isOpen: boolean;
  onClose?: () => void;
}
export function ProfileSocialsModal(props: ProfileSocialsModalProps) {
  const { isOpen, onClose = () => {} } = props;

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const [{ data: profileListingSocialsData }, refetch] =
    useProfileListingSocialsQuery({
      variables: {
        profile_listing_id: currentProfile?.profile_listing?.id ?? "",
      },
    });

  const [_, updateSocials] = useUpdateListingSocialsMutation();

  const [socials, setSocials] = useState<Record<string, string>>({});

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

    onClose();
  };

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, profileListingSocialsData?.profile_listing_social, setSocials]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      actionText="Save"
      onAction={handleSaveSocials}
      secondaryActionText="Cancel"
      onSecondaryAction={onClose}
    >
      <div className="flex flex-col gap-2 p-8 w-120">
        <div className="flex items-center gap-4">
          <BxsEnvelope className="h-7 w-7 flex-none" />
          <Input disabled value={userData?.email} className="w-full" />
        </div>

        {ALL_SOCIAL_TYPES.map((socialType, idx) => {
          const properties = MAP_SOCIAL_TYPE_TO_PROPERTIES[socialType];

          return (
            <div className="flex items-center gap-4" key={idx}>
              <div className="w-7 h-7 flex-none">{properties.icon}</div>
              <TextInput
                renderPrefix={properties.renderPrefix}
                placeholder={properties.placeholder}
                className="w-full"
                value={socials[socialType] ?? ""}
                onValueChange={(newValue) => {
                  setSocials((prev) => ({
                    ...prev,
                    [socialType]: newValue,
                  }));
                }}
              />
            </div>
          );
        })}
      </div>
    </ActionModal>
  );
}
