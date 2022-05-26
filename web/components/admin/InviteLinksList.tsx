import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  Profile_Role_Enum,
  Space_Invite_Link_Type_Enum,
  useCreateInviteLinkMutation,
  useInviteLinksQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button } from "../atomic";

import { CopyLink } from "./CopyLink";

export function InviteLinksList() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole } = useCurrentProfile();

  const [_, createInviteLink] = useCreateInviteLinkMutation();

  const [{ data: inviteLinksData }, refetchInviteLinks] = useInviteLinksQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }
  if (!currentProfileHasRole(Profile_Role_Enum.Admin)) {
    return <div>You must be an admin to view invite links</div>;
  }
  return (
    <div className="">
      <div className="flex flex-col gap-2">
        {inviteLinksData?.space_invite_link?.map((inviteLink) => {
          const link = `${window.location.origin}/space/${currentSpace.slug}/join/${inviteLink.id}`;
          return (
            <div key={inviteLink.id}>
              <CopyLink link={link} />
              <div className="ml-16">
                Expires{" "}
                {format(new Date(inviteLink.expires_at), "MMM dd yyyy, h:mm a")}
              </div>
            </div>
          );
        })}
      </div>
      <Button
        onClick={async () => {
          const { data, error } = await createInviteLink({
            space_id: currentSpace.id,
            type: Space_Invite_Link_Type_Enum.Member,
            expires_at: new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 7
            ).toISOString(), // One week
          });

          if (error) {
            toast.error(error.message);
          } else {
            toast.success("Invite link created");
            refetchInviteLinks();
          }
        }}
      >
        Create Invite Link
      </Button>
    </div>
  );
}
