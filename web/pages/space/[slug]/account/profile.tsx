import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { InviteLinksList } from "../../../../components/admin/InviteLinksList";
import { MembersList } from "../../../../components/admin/MembersList";
import { Button, Text } from "../../../../components/atomic";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../../components/EditProfileListing";
import { Navbar } from "../../../../components/Navbar";
import { RoundedCard } from "../../../../components/RoundedCard";
import { SidePadding } from "../../../../components/SidePadding";
import { BxsReport } from "../../../../generated/icons/solid";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useUserData } from "../../../../hooks/useUserData";

export default function AccountProfilePage() {
  const router = useRouter();

  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  const hasListing = !!currentProfile.profile_listing;

  return (
    <SidePadding className="min-h-screen">
      <Navbar />
      <div className="h-16"></div>
      <Breadcrumbs />
      <div className="h-16"></div>

      <Text variant="heading2">Edit your profile</Text>

      <div className="h-12"></div>

      {hasListing ? (
        <EditProfileListing />
      ) : (
        <>
          <Text>You {"haven't"} created a profile yet.</Text>
          <div className="h-4"></div>
          <Button
            rounded
            onClick={() => {
              if (!currentSpace) {
                toast.error("currentSpace not defined");
                return;
              }
              router.push(`/space/${currentSpace.slug}/create-profile`);
            }}
          >
            Create a profile
          </Button>
        </>
      )}
      <div className="h-32"></div>
    </SidePadding>
  );
}
