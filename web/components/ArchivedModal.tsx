import { ReactNode, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { Profile_Role_Enum, useUserQuery } from "../generated/graphql";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";

import { Button, Modal, Text } from "./atomic";

const SAFE_LINKS = ["join", "create-profile"];

export function ArchivedModal() {
  const router = useRouter();
  const { currentProfile, currentProfileHasRole } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();

  const [{ data: ownerUserData, fetching }, refetchUserData] = useUserQuery({
    variables: { id: currentSpace?.owner_id ?? "" },
  });

  // http://localhost:3000/space/uchicago-buddy-up/join/6d59aa5a-7b58-4ff3-a810-23602d571e80

  const isArchived = currentProfileHasRole(Profile_Role_Enum.Archived);

  const pathSegment = router.asPath.split("/")[3];
  const showModal = !!isArchived && !SAFE_LINKS.includes(pathSegment);

  return (
    <Modal isOpen={showModal} onClose={() => {}}>
      <div className="rounded-md bg-white">
        <div className="rounded-md bg-white px-8 pt-16 pb-8">
          <div className="flex w-96 flex-col items-center">
            <Text variant="heading4">Your profile has been archived.</Text>
            <div className="h-8"></div>
            <Text>
              Your admin has archived your profile, meaning you can no longer
              access or participate in this space, <i>unless</i> you join again
              with a new invite link.
            </Text>
            <div className="h-4"></div>
            <Text>
              If you believe that this was a mistake, please contact the space
              owner at {ownerUserData?.user_by_pk?.email}.
            </Text>
            <div className="h-12"></div>
            <Link href="/" passHref>
              <Button rounded>Back to home</Button>
            </Link>
            <div className="h-16"></div>
            <img
              draggable={false}
              src="/assets/create-profile/many_trees.svg"
              alt="many trees"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
