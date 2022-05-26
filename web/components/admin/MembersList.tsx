import { Fragment } from "react";

import { format } from "date-fns";

import { useProfilesBySpaceIdQuery } from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

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
      <div className="grid grid-cols-3">
        <strong>Email</strong>
        <strong>Roles</strong>
        <strong>Created At</strong>
        {profilesData?.profile?.map((profile) => {
          return (
            <Fragment key={profile.id}>
              <div>{profile.user.email}</div>
              <div>
                {profile.profile_roles
                  .map((role) => role.profile_role)
                  .join(", ")}
              </div>
              <div>
                {format(new Date(profile.created_at), "MMM dd yyyy, h:mm a")}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
