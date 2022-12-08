import Link from "next/link";
import { useRouter } from "next/router";

import { Button, Text } from "../../../../components/atomic";
import { EditProfileListing } from "../../../../components/EditProfileListing";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { useUserData } from "../../../../hooks/useUserData";

export default function AccountProfilePage() {
  const router = useRouter();

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();

  const spaceSlug = useQueryParam("slug", "string");

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  const hasListing = !!currentProfile.profile_listing;

  return (
    <div className="bg-gray-50">
      <Navbar />
      <SidePadding className="min-h-screen">
        <div className="h-16"></div>
        {/* <Breadcrumbs /> */}
        <Link href={`/space/${spaceSlug}`}>{"< Back to home"}</Link>

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
                router.push(`/space/${spaceSlug}/create-profile`);
              }}
            >
              Create a profile
            </Button>
          </>
        )}
        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
}
