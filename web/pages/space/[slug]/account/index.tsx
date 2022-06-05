import { useEffect, useMemo } from "react";

import { useRouter } from "next/router";

import { InviteLinksList } from "../../../../components/admin/InviteLinksList";
import { MembersList } from "../../../../components/admin/MembersList";
import { Button, Text } from "../../../../components/atomic";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../../components/EditProfileListing";
import { Navbar } from "../../../../components/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { RoundedCard } from "../../../../components/RoundedCard";
import { SidePadding } from "../../../../components/SidePadding";
import {
  ConnectionRequestsQuery,
  useConnectionRequestsQuery,
} from "../../../../generated/graphql";
import { BxShow, BxUserCircle } from "../../../../generated/icons/regular";
import {
  BxsReport,
  BxsShow,
  BxsUserCircle,
} from "../../../../generated/icons/solid";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useUserData } from "../../../../hooks/useUserData";

interface EditConnectionRequestProps {
  connectionRequest: ConnectionRequestsQuery["connection_request"][number];
}
function EditConnectionRequest(props: EditConnectionRequestProps) {
  const { connectionRequest } = props;

  const { currentProfile } = useCurrentProfile();

  if (!currentProfile) {
    return null;
  }

  const otherProfile =
    connectionRequest.sender_profile.id === currentProfile.id
      ? connectionRequest.receiver_profile
      : connectionRequest.sender_profile;
  const { first_name, last_name } = otherProfile.user;
  return (
    <div className="flex">
      <ProfileImage
        src={otherProfile.profile_listing?.profile_listing_image?.image.url}
        className="h-10 w-10"
      />
      <Text>
        {first_name} {last_name}
      </Text>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();

  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data: connectionRequestsData }] = useConnectionRequestsQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });
  const connectionRequests = connectionRequestsData?.connection_request ?? [];

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

      <div className="flex gap-4">
        <div className="flex flex-col gap-4 items-start flex-1">
          <RoundedCard className="w-full">
            <div className="flex items-center gap-2">
              <BxsUserCircle className="h-7 w-7 text-gray-600" />
              <Text variant="heading4">Your Profile</Text>
            </div>
            <div className="h-8"></div>
            <Text>View and make sure your info is up to date.</Text>
            <div className="h-4"></div>
            <Button
              variant="outline"
              onClick={() => {
                router.push(`${router.asPath}/profile`);
              }}
            >
              View Profile
            </Button>
          </RoundedCard>
          <RoundedCard className="w-full">
            <div className="flex items-center gap-2">
              <BxsShow className="h-7 w-7 text-gray-600" />
              <Text variant="heading4">List Your Profile</Text>
            </div>
            <div className="h-8"></div>
            <Text>On the way!</Text>
          </RoundedCard>
        </div>
        <RoundedCard className="w-full flex-1">
          <div className="flex items-center gap-2">
            <BxsReport className="h-7 w-7 text-gray-600" />
            <Text variant="heading4">Your connections</Text>
          </div>
          <div className="h-8"></div>
          <Text>View and make sure your info is up to date.</Text>
          <div className="h-4"></div>

          {connectionRequests.length === 0 && (
            <div className="p-4 rounded-md border">
              <Text>No connections yet!</Text>
              <div className="h-2"></div>
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/space/${currentSpace.slug}`);
                }}
              >
                Browse profiles
              </Button>
            </div>
          )}
          {connectionRequests.map((request) => {
            return (
              <EditConnectionRequest
                connectionRequest={request}
                key={request.id}
              />
            );
          })}
        </RoundedCard>
      </div>
    </SidePadding>
  );
}
