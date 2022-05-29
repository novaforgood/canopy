import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { Button, Text } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../components/EditProfileListing";
import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

export default function AdminPage() {
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
    <SidePadding>
      <Navbar />
      <div className="h-16"></div>
      <Breadcrumbs />
      <div className="h-16"></div>

      <Text variant="subheading1">Edit my profile</Text>

      <div className="h-4"></div>
      <EditProfileListing />
      <div className="h-32"></div>
    </SidePadding>
  );
}
