import { Fragment } from "react";

import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  useProfileByIdQuery,
  useUpdateProfileRoleMutation,
} from "../../generated/graphql";
import { BxsCrown } from "../../generated/icons/solid";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../hooks/useIsLoggedIn";
import { getFullNameOfUser } from "../../lib/user";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { ProfileImage } from "../common/ProfileImage";

import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";
interface MemberRowProps {
  profileId: string;
}
export function MemberRow(props: MemberRowProps) {
  const { profileId } = props;

  const isLoggedIn = useIsLoggedIn();

  const [{ data }] = useProfileByIdQuery({
    requestPolicy: "cache-first",
    variables: { profile_id: profileId, is_logged_in: isLoggedIn },
  });

  const { currentSpace } = useCurrentSpace();

  const [_, updateProfileRole] = useUpdateProfileRoleMutation();
  const profile = data?.profile_by_pk;

  if (!profile) {
    return null;
  }

  const role = profile.profile_roles[0];

  const fullName = getFullNameOfUser(profile.user);
  const email = profile.user?.email ?? "N/A";

  return (
    <Fragment>
      <div className="flex items-center">
        <ProfileImage
          className="mr-2 h-10 w-10"
          src={
            profile.profile_listing?.profile_listing_image?.image.url ?? null
          }
        />
        {fullName}{" "}
        {currentSpace?.owner_id === profile.user?.id && (
          <BxsCrown className="ml-2 h-4 w-4 text-gray-600" />
        )}
      </div>
      <input value={email} readOnly className="truncate" />
      <SelectAutocomplete
        className="w-48"
        options={ROLE_SELECT_OPTIONS}
        value={role.profile_role}
        onSelect={async (newRole) => {
          if (newRole) {
            toast.promise(
              updateProfileRole({ row_id: role.id, profile_role: newRole }),
              {
                loading: "Loading",
                success: `Updated ${fullName}'s role to ${MAP_ROLE_TO_TITLE[newRole]}`,
                error: "Error when fetching",
              }
            );
          }
        }}
      />
      {/* <div>{format(new Date(profile.created_at), "MMM dd yyyy, h:mm a")}</div> */}
    </Fragment>
  );
}
