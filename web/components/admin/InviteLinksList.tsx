import { useState } from "react";

import { format, formatDistance } from "date-fns";
import toast from "react-hot-toast";

import {
  Profile_Role_Enum,
  Space_Invite_Link_Type_Enum,
  useCreateInviteLinkMutation,
  useInviteLinksQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button, Select, Text } from "../atomic";

import { CopyLink } from "./CopyLink";
import {
  INVITE_LINK_OPTIONS,
  MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL,
} from "./inviteLinks";

export function InviteLinksList() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole } = useCurrentProfile();

  const [_, createInviteLink] = useCreateInviteLinkMutation();

  const [linkType, setLinkType] = useState<Space_Invite_Link_Type_Enum | null>(
    Space_Invite_Link_Type_Enum.Member
  );

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
            <div key={inviteLink.id} className="border p-4">
              <CopyLink link={link} />
              <div className="ml-16 text-gray-600">
                <Text>
                  Expires:{" "}
                  <Text bold>
                    {formatDistance(
                      new Date(inviteLink.expires_at),
                      new Date(),
                      { addSuffix: true }
                    )}
                    {/* {format(
                      new Date(inviteLink.expires_at),
                      "MMM dd yyyy, h:mm a"
                    )} */}
                  </Text>
                </Text>
              </div>
              <div className="ml-16 text-gray-600">
                <Text>
                  Type:{" "}
                  <Text bold>
                    {MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL[inviteLink.type]}
                  </Text>
                </Text>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-8"></div>
      <div className="flex items-center gap-4">
        <Button
          onClick={async () => {
            if (!linkType) {
              toast.error("Please select a link type");
              return;
            }

            const { data, error } = await createInviteLink({
              space_id: currentSpace.id,
              type: linkType,
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
        <Select
          className="w-64"
          options={INVITE_LINK_OPTIONS}
          value={linkType}
          onSelect={setLinkType}
        ></Select>
      </div>
    </div>
  );
}
