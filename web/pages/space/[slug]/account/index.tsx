import { useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../../../../components/atomic";
import { Breadcrumbs } from "../../../../components/common/Breadcrumbs";
import { ProfileImage } from "../../../../components/common/ProfileImage";
import { RoundedCard } from "../../../../components/common/RoundedCard";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import {
  ConnectionRequestsQuery,
  Connection_Request_Status_Enum,
  useConnectionRequestsQuery,
  useUpdateConnectionRequestMutation,
} from "../../../../generated/graphql";
import { BxsReport, BxsUserCircle } from "../../../../generated/icons/solid";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useUserData } from "../../../../hooks/useUserData";
import { getTimeRelativeToNow } from "../../../../lib";
import { getFullNameOfUser } from "../../../../lib/user";

interface EditConnectionRequestProps {
  connectionRequest: ConnectionRequestsQuery["connection_request"][number];
}
function EditConnectionRequest(props: EditConnectionRequestProps) {
  const { connectionRequest } = props;

  const { currentProfile } = useCurrentProfile();

  const [_, updateConnectionRequest] = useUpdateConnectionRequestMutation();

  const [loading, setLoading] = useState(false);

  if (!currentProfile) {
    return null;
  }

  const amSender = currentProfile.id === connectionRequest.sender_profile_id;
  const otherProfile = amSender
    ? connectionRequest.receiver_profile
    : connectionRequest.sender_profile;

  const timestampText = amSender ? "Sent" : "Received";
  const timestampString = `${timestampText} ${getTimeRelativeToNow(
    new Date(connectionRequest.created_at)
  )}`;

  const fullName = getFullNameOfUser(otherProfile.user);
  return (
    <div className="flex w-full items-center gap-4">
      <ProfileImage
        src={otherProfile.profile_listing?.profile_listing_image?.image.url}
        className="h-10 w-10"
      />
      <div className="flex flex-1 flex-col items-start truncate">
        <Text className="flex-1 truncate">{fullName}</Text>
        <Text italic variant="body2" className="text-gray-600">
          {timestampString}
        </Text>
      </div>
      {connectionRequest.status === Connection_Request_Status_Enum.MetWith ? (
        <Button
          variant="outline"
          size="small"
          className="w-28 shrink-0 justify-center"
          disabled
        >
          Met with
        </Button>
      ) : (
        <Button
          variant="outline"
          size="small"
          className="w-28 shrink-0 justify-center"
          loading={loading}
          onClick={() => {
            setLoading(true);
            updateConnectionRequest({
              connection_request_id: connectionRequest.id,
              variables: {
                status: Connection_Request_Status_Enum.MetWith,
              },
            })
              .catch((e) => {
                toast.error("Error checking in");
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          Check in
        </Button>
      )}
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
    <div className="bg-gray-50">
      <Navbar />
      <SidePadding className="min-h-screen">
        <div className="h-16"></div>
        <Breadcrumbs />
        <div className="h-16"></div>

        <Text variant="heading2" mobileVariant="heading3">
          Nice to see you, {userData?.first_name}!
        </Text>
        <div className="h-8"></div>
        <Text medium>
          Welcome to Your Account. Manage your settings to make Canopy work best
          for you.
        </Text>
        <div className="h-8"></div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col items-start gap-4">
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
            {/* <RoundedCard className="w-full">
            <div className="flex items-center gap-2">
              <BxsShow className="h-7 w-7 text-gray-600" />
              <Text variant="heading4">List Your Profile</Text>
            </div>
            <div className="h-8"></div>
            <Text>Work in progress</Text>
          </RoundedCard> */}
          </div>
          <RoundedCard className="w-full flex-1">
            <div className="flex items-center gap-2">
              <BxsReport className="h-7 w-7 text-gray-600" />
              <Text variant="heading4">Your connections</Text>
            </div>
            <div className="h-8"></div>
            <Text>
              Press {'"Check in"'} if you have met with your connection!
            </Text>
            <div className="h-8"></div>

            {connectionRequests.length === 0 && (
              <div className="rounded-md border p-4">
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
            <div className="flex w-full flex-col items-start gap-4">
              {connectionRequests.map((request) => {
                return (
                  <EditConnectionRequest
                    connectionRequest={request}
                    key={request.id}
                  />
                );
              })}
            </div>
          </RoundedCard>
        </div>
      </SidePadding>
    </div>
  );
}
