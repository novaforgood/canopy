import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../components/atomic/Button";
import {
  useCreateInviteLinkMutation,
  useSpaceBySlugQuery,
  useUserQuery,
} from "../../../generated/graphql";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../hooks/useIsLoggedIn";
import { useSignIn } from "../../../hooks/useSignIn";
import { useUserData } from "../../../hooks/useUserData";
import { auth } from "../../../lib/firebase";

function CreateInviteLink() {
  const [createInviteLink] = useCreateInviteLinkMutation();
  return (
    <div className="p-4">
      <Button>Create Invite Link</Button>
    </div>
  );
}
export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
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
