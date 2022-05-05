import { useClipboard } from "@mantine/hooks";
import { format } from "date-fns";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Button } from "../../../components/atomic/Button";
import {
  Space_Invite_Link_Type_Enum,
  useCreateInviteLinkMutation,
  useInviteLinksQuery,
  useProfilesBySpaceIdQuery,
} from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

function CopyLink({ link }: { link: string }) {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <div className="flex gap-4">
      <button
        onClick={() => {
          clipboard.copy(link);
        }}
      >
        {clipboard.copied ? "Copied!" : "Copy"}
      </button>
      <a href={link}>{link}</a>
    </div>
  );
}

function CreateInviteLink() {
  const { currentSpace } = useCurrentSpace();

  const [_, createInviteLink] = useCreateInviteLinkMutation();

  const [{ data: inviteLinksData }, refetchInviteLinks] = useInviteLinksQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <div className="text-xl font-bold">Invite Links</div>
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

function ShowAllUsers() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: profilesData }] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <div className="text-xl font-bold">Users</div>
      <div className="grid grid-cols-4">
        <strong>Email</strong>
        <strong>Roles</strong>
        <strong>Listing Enabled</strong>
        <strong>Created At</strong>
        {profilesData?.profile?.map((profile) => {
          return (
            <Fragment key={profile.id}>
              <div>{profile.user.email}</div>
              <div>
                {profile.profile_roles
                  .map((role) => role.profile_role)
                  .join(", ")}
              </div>
              <div>{profile.listing_enabled ? "true" : "false"}</div>
              <div>
                {format(new Date(profile.created_at), "MMM dd yyyy, h:mm a")}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function SpaceHomepage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
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
      <div className="h-8"></div>
      <CreateInviteLink />
      <div className="h-8"></div>

      <ShowAllUsers />
    </div>
  );
}
