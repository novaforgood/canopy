import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useClient } from "urql";

import {
  AllProfilesOfUserQuery,
  AllProfilesOfUserQueryVariables,
  AllProfilesOfUserDocument,
  ProfileListingDocument,
  ProfileListingQuery,
  ProfileListingQueryVariables,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrevious } from "../../hooks/usePrevious";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { useUserData } from "../../hooks/useUserData";
import {
  DEFAULT_PROFILE_ATTRIBUTES,
  ProfileAttributes,
} from "../../lib/profileAttributes";
import { Button, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";

export function ProfileSettings() {
  const { currentProfile, profileAttributes, updateProfileAttributes } =
    useCurrentProfile();
  const { currentSpace } = useCurrentSpace();

  const [settings, setSettings] = useState<ProfileAttributes>();
  const { localMustSave, setMustSave } = useSaveChangesState();

  const prevAttrs = usePrevious(profileAttributes);
  useEffect(() => {
    const prevJson = JSON.stringify(prevAttrs);
    const newJson = JSON.stringify(profileAttributes);
    if (profileAttributes && prevJson !== newJson) {
      setSettings(profileAttributes);
    }
  }, [prevAttrs, profileAttributes]);

  const [loading, setLoading] = useState(false);
  const client = useClient();

  const isProfileListingPublic = useCallback(async () => {
    if (!currentProfile?.profile_listing) {
      return false;
    }
    const { data } = await client
      .query<ProfileListingQuery, ProfileListingQueryVariables>(
        ProfileListingDocument,
        { profile_listing_id: currentProfile.profile_listing.id }
      )
      .toPromise();
    if (!data?.profile_listing_by_pk || !data.profile_listing_by_pk.public) {
      return false;
    }
    return true;
  }, [client, currentProfile?.profile_listing]);

  return (
    <>
      <Text variant="heading3">Settings for {currentSpace?.name}</Text>
      <div className="h-2"></div>
      <Text variant="body1" className="text-gray-700">
        These settings apply in {currentSpace?.name}, the space you are
        currently in.
      </Text>

      <div className="h-12"></div>
      <CheckBox
        label={`Opt in to intros (admins can randomly match you with other members in a group chat)`}
        checked={settings?.enableChatIntros ?? false}
        onChange={async (e) => {
          const newVal = e.target?.checked ?? false;
          setMustSave(true);

          if (newVal) {
            const isPublic = await isProfileListingPublic();
            console.log(isPublic);
            if (!isPublic) {
              toast.error(
                "You must make your profile public to opt in to intros"
              );
              return;
            }
          }

          setSettings((prev) => ({
            ...DEFAULT_PROFILE_ATTRIBUTES,
            ...prev,
            enableChatIntros: newVal,
          }));
        }}
      />
      <div className="h-8"></div>
      <Button
        disabled={!localMustSave}
        rounded
        onClick={() => {
          if (!settings) return;

          setLoading(true);
          updateProfileAttributes(settings)
            .then((res) => {
              if (res.error) {
                throw new Error(res.error.message);
              } else {
                setMustSave(false);
                toast.success("Saved settings");
              }
            })
            .catch((err) => {
              toast.error(err.message);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        loading={loading}
      >
        Save changes
      </Button>
    </>
  );
}
