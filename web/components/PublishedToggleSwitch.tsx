import { Switch } from "@headlessui/react";
import toast from "react-hot-toast";

import { Text } from "../components/atomic";
import {
  useProfileListingQuery,
  useUpdateProfileListingMutation,
} from "../generated/graphql";

interface PublishedToggleSwitchProps {
  profileListingId: string;
}
export default function PublishedToggleSwitch(
  props: PublishedToggleSwitchProps
) {
  const { profileListingId } = props;

  const [{ data: profileListingData }] = useProfileListingQuery({
    variables: { profile_listing_id: profileListingId },
  });

  const [_, updateProfileListing] = useUpdateProfileListingMutation();

  if (!profileListingData?.profile_listing_by_pk) {
    return null;
  }

  const profileIsPublic = profileListingData.profile_listing_by_pk.public;

  console.log(profileIsPublic);
  return (
    <div className="flex gap-4 items-center">
      <Switch
        checked={profileIsPublic}
        onChange={async (newVal) => {
          toast.promise(
            updateProfileListing({
              profile_listing_id: profileListingId,
              profile_listing: { public: newVal },
            }),
            {
              loading: "Loading",
              success: `Profile is now ${newVal ? "public" : "private"}`,
              error: "Error when setting profile public status",
            }
          );
        }}
        className={`${profileIsPublic ? "bg-black" : "bg-gray-600"}
          relative inline-flex h-7 w-28 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${profileIsPublic ? "translate-x-7" : "translate-x-0"}
            pointer-events-none inline-block h-6 w-20 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        >
          <div>{`${profileIsPublic ? "Public" : "Private"}`}</div>
        </span>
      </Switch>
      {profileIsPublic && (
        <Text>This profile is public to all members of RainbowDirectory. </Text>
      )}
    </div>
  );
}
