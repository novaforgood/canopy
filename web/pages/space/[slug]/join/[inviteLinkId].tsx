import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../../components/atomic/Button";
import {
  useSpaceBySlugQuery,
  useUserQuery,
} from "../../../../generated/graphql";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { useSignIn } from "../../../../hooks/useSignIn";
import { useUserData } from "../../../../hooks/useUserData";
import { auth } from "../../../../lib/firebase";

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const inviteLinkId = useQueryParam("inviteLinkId", "string");
  console.log(inviteLinkId);

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }
  if (!inviteLinkId) {
    return <div>404 - Invite link not found</div>;
  }

  return (
    <div className="p-4">
      <div className="text-2xl">
        Welcome to <b>{currentSpace.name}</b>!
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
