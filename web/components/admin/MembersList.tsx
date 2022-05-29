import { Fragment } from "react";

import { format } from "date-fns";

import {
  useProfileByIdQuery,
  useProfilesBySpaceIdQuery,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

interface MemberRowProps {
  profileId: string;
}
function MemberRow(props: MemberRowProps) {
  const { profileId } = props;
  const [{ data }] = useProfileByIdQuery({
    requestPolicy: "cache-first",
    variables: { profile_id: profileId },
  });

  const profile = data?.profile_by_pk;

  if (!profile) {
    return null;
  }

  return (
    <Fragment>
      <div>{profile.user.email}</div>
      <div>
        {profile.profile_roles.map((role) => role.profile_role).join(", ")}
      </div>
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
      <div className="grid grid-cols-3">
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
