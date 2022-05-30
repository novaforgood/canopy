import { Fragment } from "react";

import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  Profile_Role_Enum,
  useProfileByIdQuery,
  useProfilesBySpaceIdQuery,
  useUpdateProfileRoleMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Select } from "../atomic";

const MAP_ROLE_TO_TITLE: Record<Profile_Role_Enum, string> = {
  [Profile_Role_Enum.Admin]: "Admin",
  [Profile_Role_Enum.Member]: "Member",
  [Profile_Role_Enum.MemberWhoCanList]: "Listed Member",
  [Profile_Role_Enum.Banned]: "Banned",
};

const ROLE_SELECT_OPTIONS = Object.values(Profile_Role_Enum).map((role) => {
  return {
    label: MAP_ROLE_TO_TITLE[role],
    value: role,
  };
});
interface MemberRowProps {
  profileId: string;
}
function MemberRow(props: MemberRowProps) {
  const { profileId } = props;
  const [{ data }] = useProfileByIdQuery({
    requestPolicy: "cache-first",
    variables: { profile_id: profileId },
  });

  const [_, updateProfileRole] = useUpdateProfileRoleMutation();
  const profile = data?.profile_by_pk;

  if (!profile) {
    return null;
  }

  const role = profile.profile_roles[0];

  const { email, first_name, last_name } = profile.user;

  return (
    <Fragment>
      <div>
        {first_name} {last_name}
      </div>
      <div>{email}</div>
      <Select
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
      <div>{format(new Date(profile.created_at), "MMM dd yyyy, h:mm a")}</div>
    </Fragment>
  );
}
export function MembersList() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: profilesData }] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <div className="grid grid-cols-4 gap-2 items-center">
        <strong>Name</strong>
        <strong>Email</strong>
        <strong>Role</strong>
        <strong>Created At</strong>
        {profilesData?.profile?.map((profile) => {
          return (
            <Fragment key={profile.id}>
              <MemberRow profileId={profile.id} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
