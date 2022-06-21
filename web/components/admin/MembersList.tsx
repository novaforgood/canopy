import { Fragment } from "react";

import {
  Profile_Role_Enum,
  useProfilesBySpaceIdQuery,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

import { MemberRow } from "./MemberRow";

export function MembersList() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: profilesData }] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 items-center w-160 sm:w-full">
      <strong>Name</strong>
      <strong>Email</strong>
      <strong>Role</strong>
      {profilesData?.profile?.map((profile) => {
        return (
          <Fragment key={profile.id}>
            <MemberRow profileId={profile.id} />
          </Fragment>
        );
      })}
    </div>
  );
}
