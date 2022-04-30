import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../components/atomic/Button";
import {
  Space_Invite_Link_Types_Enum,
  useCreateInviteLinkMutation,
  useInviteLinksQuery,
  useSpaceBySlugQuery,
  useUserQuery,
} from "../../../generated/graphql";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../hooks/useIsLoggedIn";
import { useSignIn } from "../../../hooks/useSignIn";
import { useUserData } from "../../../hooks/useUserData";
import { auth } from "../../../lib/firebase";

function CreateInviteLink() {
  const { currentSpace } = useCurrentSpace();
  const router = useRouter();
  console.log(router);

  const [_, createInviteLink] = useCreateInviteLinkMutation();
  const [{ data: inviteLinksData }, refetchInviteLinks] = useInviteLinksQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="p-4">
      <div>Invite links:</div>
      <div>
        {inviteLinksData?.space_invite_links?.map((inviteLink) => {
          const link = `${window.location.origin}/space/${currentSpace.slug}/join/${inviteLink.id}`;
          return (
            <div key={inviteLink.id}>
              <a href={link}>{link}</a>
            </div>
          );
        })}
      </div>
      <Button
        onClick={async () => {
          await createInviteLink({
            space_id: currentSpace.id,
            type: Space_Invite_Link_Types_Enum.Member,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // One week
          });

          refetchInviteLinks();
        }}
      >
        Create Invite Link
      </Button>
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

      <CreateInviteLink />
    </div>
  );
}
