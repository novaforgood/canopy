import { useCallback } from "react";

import { Switch } from "@headlessui/react";
import toast, { ErrorIcon } from "react-hot-toast";
import { useClient } from "urql";

import { Text } from "../components/atomic";
import {
  AllProfilesOfUserDocument,
  AllProfilesOfUserQuery,
  AllProfilesOfUserQueryVariables,
  Profile_Listing_Update_Column,
  useProfileListingQuery,
  useUpsertProfileListingMutation,
} from "../generated/graphql";
import { BxsHide, BxsShow } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";
import { useValidateProfileCompletion } from "../hooks/useValidateProfileCompletion";

/**
 * A toggle switch that allows the user to publish/unpublish their profile.
 */
interface PublishedToggleSwitchProps {
  profileListingId: string;
}
export default function PublishedToggleSwitch(
  props: PublishedToggleSwitchProps
) {
  const { profileListingId } = props;

  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const { validateProfileCompletion } = useValidateProfileCompletion();

  const [{ data: profileListingData, fetching }] = useProfileListingQuery({
    variables: { profile_listing_id: profileListingId },
  });

  const [_, upsertProfileListing] = useUpsertProfileListingMutation();

  const profileIsPublic =
    profileListingData?.profile_listing_by_pk?.public ?? false;

  const attemptSetPublicity = useCallback(
    async (newVal: boolean) => {
      if (!currentProfile) {
        throw new Error("No current profile");
      }

      if (newVal === true) {
        const response = await validateProfileCompletion();
        if (response.valid === false) {
          throw new Error(response.error);
        }
      }

      return upsertProfileListing({
        profile_listing: {
          public: newVal,
          profile_id: currentProfile.id,
        },
        update_columns: [Profile_Listing_Update_Column.Public],
      });
    },
    [currentProfile, upsertProfileListing, validateProfileCompletion]
  );

  if (fetching) return null;

  return (
    <div className="flex items-center gap-4">
      <Switch
        checked={profileIsPublic}
        onChange={async (newVal: boolean) => {
          toast.promise(
            attemptSetPublicity(newVal),

            {
              loading: "Loading",
              success: `Profile is now ${newVal ? "published" : "private"}`,
              error: (err) => err.message,
            },
            {
              success: {
                icon: newVal ? (
                  <BxsShow className="h-6 w-6" />
                ) : (
                  <BxsHide className="h-6 w-6" />
                ),
              },
            }
          );
        }}
        className={`${profileIsPublic ? "bg-lime-600" : "bg-gray-400"}
          relative inline-flex h-7 w-32 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${profileIsPublic ? "translate-x-7" : "translate-x-0"}
            pointer-events-none inline-block h-6 w-24 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        >
          <div>{`${profileIsPublic ? "Published" : "Private"}`}</div>
        </span>
      </Switch>
      {profileIsPublic ? (
        <Text>
          This profile is visible to all members of {currentSpace?.name}.
        </Text>
      ) : (
        <Text>This profile is only visible to you.</Text>
      )}
    </div>
  );
}
