import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

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

  return (
    <SidePadding>
      <Navbar />
      <div className="h-16"></div>
      <Breadcrumbs />
      <div className="h-16"></div>

      <Text variant="heading2">Nice to see you, {userData?.first_name}!</Text>
      <div className="h-8"></div>
      <Text bold>
        Welcome to Your Account. Manage your settings to make Canopy work best
        for you.
      </Text>
      <div className="h-8"></div>

      <div className="h-8"></div>
      <RoundedCard className="w-full">
        <div className="flex items-center gap-2">
          <BxsReport className="h-7 w-7" />
          <Text variant="heading4">Program </Text>
        </div>
        <div className="h-8"></div>
        <Text>On the way!</Text>
      </RoundedCard>

      <div className="h-4"></div>
      <EditProfileListing />
      <div className="h-32"></div>
    </SidePadding>
  );
}
