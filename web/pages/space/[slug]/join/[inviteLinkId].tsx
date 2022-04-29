import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../../components/atomic/Button";
import {
  useSpaceBySlugQuery,
  useUserQuery,
} from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { useSignIn } from "../../../../hooks/useSignIn";
import { useUserData } from "../../../../hooks/useUserData";
import { auth } from "../../../../lib/firebase";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();
  const inviteLinkId = useQueryParam("inviteLinkId", "string");

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
  }

  return (
    <div className="p-4">
      <div className="text-2xl">
        Join <b>{currentSpace.name}</b>!
      </div>
      <div>There is nothing here lol</div>
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
