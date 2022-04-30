import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "../../../../components/atomic/Button";
import { useApiClient } from "../../../../hooks/useApiClient";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useQueryParam } from "../../../../hooks/useQueryParam";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();
  const { apiClient } = useApiClient();

  const inviteLinkId = useQueryParam("inviteLinkId", "string");

  const joinSpace = useCallback(async () => {
    await apiClient
      .post<any, { newProfileId: string }>("/api/invite/joinProgram", {
        inviteLinkId,
      })
      .then((response) => {
        toast.success("Good job");
      })
      .catch((e) => {
        toast.error(`Error: ${e.message}`);
      });
  }, [apiClient, inviteLinkId]);

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }
  if (!inviteLinkId) {
    return <div>404 - Invite link not found</div>;
  }

  if (currentProfile) {
    return (
      <div>
        You are already a part of this space.
        <Button
          onClick={() => {
            router.push(`/space/${currentSpace.slug}`);
          }}
        >
          Go to space
        </Button>
      </div>
    );
  } else {
    return (
      <div className="p-4">
        <div className="text-2xl">
          Join <b>{currentSpace.name}</b>!
        </div>
        <Button onClick={joinSpace}>Join space</Button>
        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          Go back to home
        </Button>
      </div>
    );
  }
}
