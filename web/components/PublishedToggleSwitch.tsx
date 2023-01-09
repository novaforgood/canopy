import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";

import { Text } from "../components/atomic";
import {
  Profile_Listing_Update_Column,
  useProfileListingQuery,
  useUpsertProfileListingMutation,
} from "../generated/graphql";
import { BxsHide, BxsShow } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";

interface PublishedToggleSwitchProps {
  profileListingId: string;
}
export default function PublishedToggleSwitch(
  props: PublishedToggleSwitchProps
) {
  const { profileListingId } = props;

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data: profileListingData, fetching }] = useProfileListingQuery({
    variables: { profile_listing_id: profileListingId },
  });

  const [_, upsertProfileListing] = useUpsertProfileListingMutation();

  const profileIsPublic =
    profileListingData?.profile_listing_by_pk?.public ?? false;

  if (fetching) return null;

  return (
    <div className="flex items-center gap-4">
      <Switch
        checked={profileIsPublic}
        onChange={async (newVal: boolean) => {
          if (!currentProfile) {
            toast.error("No current profile");
            return;
          }
          toast.promise(
            upsertProfileListing({
              profile_listing: {
                public: newVal,
                profile_id: currentProfile.id,
              },
              update_columns: [Profile_Listing_Update_Column.Public],
            }),
            {
              loading: "Loading",
              success: `Profile is now ${newVal ? "published" : "private"}`,
              error: "Error when setting profile public status",
            },
            {
              icon: newVal ? (
                <BxsShow className="h-6 w-6" />
              ) : (
                <BxsHide className="h-6 w-6" />
              ),
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
