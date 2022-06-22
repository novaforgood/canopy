import { Fragment } from "react";

import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  useProfileByIdQuery,
  useUpdateProfileRoleMutation,
} from "../../generated/graphql";
import { BxsCrown } from "../../generated/icons/solid";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Select } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { ProfileImage } from "../ProfileImage";

import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";
interface MemberRowProps {
  profileId: string;
}
export function MemberRow(props: MemberRowProps) {
  const { profileId } = props;
  const [{ data }] = useProfileByIdQuery({
    requestPolicy: "cache-first",
    variables: { profile_id: profileId },
  });

  const { currentSpace } = useCurrentSpace();

  const [_, updateProfileRole] = useUpdateProfileRoleMutation();
  const profile = data?.profile_by_pk;

  if (!profile) {
    return null;
  }

  const role = profile.profile_roles[0];

  const { email, first_name, last_name } = profile.user;

  return (
    <Fragment>
      <div className="flex items-center">
        <ProfileImage
          className="h-10 w-10 mr-2"
          src={
            profile.profile_listing?.profile_listing_image?.image.url ?? null
          }
        />
        {first_name} {last_name}{" "}
        {currentSpace?.owner_id === profile.user.id && (
          <BxsCrown className="h-4 w-4 ml-2 text-gray-600" />
        )}
      </div>
      <div>{email}</div>
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
                success: `Updated ${first_name}'s role to ${MAP_ROLE_TO_TITLE[newRole]}`,
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
