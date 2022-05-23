import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { Button } from "../../../components/atomic";
import { EditProfileListing } from "../../../components/EditProfileListing";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  return (
    <div className="p-4">
      <div className="text-2xl">
        Welcome to <b>{currentSpace.name}</b>!
      </div>
      <div>There is nothing here lol</div>
      <Button
        onClick={() => {
          router.push("/");
        }}
      >
        Go back to home
      </Button>
      <div className="h-8"></div>
      <div className="text-xl font-bold">Invite Links</div>
      <InviteLinksList />

      <div className="h-8"></div>
      <div className="text-xl font-bold">Users</div>
      <MembersList />

      <div className="h-8"></div>
      <div className="text-xl font-bold">Edit my profile</div>
      <EditProfileListing />
    </div>
  );
}
