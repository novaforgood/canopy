import { useCallback, useEffect, useMemo, useState } from "react";

import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../../../../components/atomic";
import { PageNotFound } from "../../../../components/error-screens/PageNotFound";
import { TwoThirdsPageLayout } from "../../../../components/layout/TwoThirdsPageLayout";
import {
  InviteLinksQuery,
  Profile_Role_Enum,
  Space_Invite_Link_Type_Enum,
  usePublicSpaceBySlugQuery,
} from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { useUserData } from "../../../../hooks/useUserData";
import { apiClient } from "../../../../lib/apiClient";

function AlreadyPartOfSpace() {
  const router = useRouter();
  const { currentSpace } = useCurrentSpace();

  return (
    <TwoThirdsPageLayout>
      <div className="flex h-[calc(100dvh)] max-w-2xl flex-col items-start justify-center px-16">
        <Text variant="heading2">You are already a part of this space.</Text>

        <div className="h-16"></div>
        <Button
          variant="primary"
          rounded
          onClick={() => {
            router.push(`/space/${currentSpace?.slug}`);
          }}
        >
          Go to space
        </Button>

        <div className="h-40"></div>
      </div>
    </TwoThirdsPageLayout>
  );
}

function JoinSpace() {
  const router = useRouter();

  const inviteLinkId = useQueryParam("inviteLinkId", "string");
  const slug = useQueryParam("slug", "string");
  const { refetchCurrentProfile } = useCurrentProfile();

  const [loading, setLoading] = useState(false);

  const { userData } = useUserData();

  const [{ data: publicSpaceData }] = usePublicSpaceBySlugQuery({
    variables: { slug: slug ?? "" },
  });
  const publicSpace = publicSpaceData?.public_space[0];

  const domainWhitelists = publicSpace?.domainWhitelists as
    | string[]
    | undefined;

  const passesEmailFilter = useMemo(() => {
    const email = userData?.email;
    if (!email) {
      return false;
    }

    if (
      domainWhitelists &&
      !domainWhitelists.some((domain) => email.endsWith(domain))
    ) {
      return false;
    }

    return true;
  }, [domainWhitelists, userData?.email]);

  const joinSpace = useCallback(async () => {
    if (!inviteLinkId) {
      return null;
    }

    return await apiClient
      .post<
        { inviteLinkId: string },
        {
          newProfileId: string;
          inviteLink: {
            inviteLinkId: string;
            type: Space_Invite_Link_Type_Enum;
          };
        }
      >("/api/invite/joinProgram", { inviteLinkId })
      .then((response) => {
        refetchCurrentProfile();
        return response;
      })
      .catch((e) => {
        toast.error(`Error: ${e.message}`);
      });
  }, [inviteLinkId, refetchCurrentProfile]);

  if (!publicSpace) {
    return <PageNotFound />;
  }

  return (
    <TwoThirdsPageLayout>
      <div className="flex h-[calc(100dvh)] max-w-2xl flex-col items-start justify-center px-16">
        <Text variant="heading2">
          You have been invited to <b>{publicSpace?.name}</b>!
        </Text>

        <div className="h-16"></div>

        {!passesEmailFilter && (
          <div>
            <Text variant="body1">
              You are not allowed to join this space because your email address
              does not end with one of: {domainWhitelists?.join(", ")}.
            </Text>
            <div className="h-4"></div>
          </div>
        )}

        <div className="text-2xl"></div>
        <Button
          loading={loading}
          disabled={!passesEmailFilter}
          onClick={() => {
            setLoading(true);
            joinSpace()
              .then((response) => {
                if (response) {
                  switch (response.inviteLink.type) {
                    case Space_Invite_Link_Type_Enum.Member: {
                      router.push(`/space/${publicSpace?.slug}`);
                      break;
                    }
                    case Space_Invite_Link_Type_Enum.MemberListingEnabled: {
                      router.push(`/space/${publicSpace?.slug}/welcome`);
                      break;
                    }
                  }
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          rounded
        >
          Join {publicSpace?.name}
        </Button>
        <div className="h-4"></div>
        <Button
          variant="outline"
          rounded
          onClick={() => {
            router.push("/");
          }}
        >
          Go back to home
        </Button>

        <div className="h-40"></div>
      </div>
    </TwoThirdsPageLayout>
  );
}

export default function SpaceHomepage() {
  const { currentProfile, currentProfileHasRole } = useCurrentProfile();

  const partOfSpace = currentProfileHasRole(Profile_Role_Enum.Member);

  if (partOfSpace) {
    return <AlreadyPartOfSpace />;
  } else {
    return <JoinSpace />;
  }
}
