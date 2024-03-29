import { useState } from "react";

import { format, formatDistance } from "date-fns";
import toast from "react-hot-toast";

import {
  Profile_Role_Enum,
  Space_Invite_Link_Type_Enum,
  useCreateInviteLinkMutation,
  useDeleteInviteLinkMutation,
  useInviteLinksQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { getTimeRelativeToNow } from "../../lib";
import { Button, Select, Text } from "../atomic";
import { DeleteButton } from "../common/DeleteButton";

import { CopyText } from "./CopyText";
import {
  INVITE_LINK_OPTIONS,
  MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL,
} from "./inviteLinks";

export function InviteLinksList() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole } = useCurrentProfile();

  const [_, createInviteLink] = useCreateInviteLinkMutation();
  const [__, deleteInviteLink] = useDeleteInviteLinkMutation();

  const [linkType, setLinkType] = useState<Space_Invite_Link_Type_Enum | null>(
    null
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
      <div className="h-8"></div>
      <div className="flex flex-col gap-2">
        {inviteLinksData?.space_invite_link?.map((inviteLink) => {
          const link = `${window.location.origin}/space/${currentSpace.slug}/join/${inviteLink.id}`;

          const expiredTime = inviteLink.expires_at
            ? new Date(inviteLink.expires_at)
            : null;
          const isExpired = expiredTime && expiredTime.getTime() < Date.now();
          return (
            <div
              key={inviteLink.id}
              className="flex w-full flex-col gap-2 border p-4 sm:flex-row sm:gap-8"
            >
              <CopyText text={link} />
              <Text className="text-gray-600">
                {!isExpired && "Expires: "}
                <Text bold>
                  {isExpired
                    ? "Expired"
                    : expiredTime === null
                    ? "Never"
                    : `${getTimeRelativeToNow(expiredTime)}`}
                </Text>
              </Text>
              <Text className="text-gray-600">
                Type:{" "}
                <Text bold>
                  {MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL[inviteLink.type]}
                </Text>
              </Text>
              <DeleteButton
                className="ml-auto"
                onClick={() => {
                  if (isExpired) {
                    // Delete
                    deleteInviteLink({ id: inviteLink.id })
                      .then(() => {
                        refetchInviteLinks();
                        toast.success("Deleted invite link!");
                      })
                      .catch((err) => {
                        toast.error(err.message);
                      });
                  } else {
                    const confirmed = window.confirm(
                      "Are you sure you would like to delete this invite link? Users will be unable to use it to join your space."
                    );
                    if (confirmed) {
                      deleteInviteLink({ id: inviteLink.id })
                        .then(() => {
                          refetchInviteLinks();
                          toast.success("Deleted invite link!");
                        })
                        .catch((err) => {
                          toast.error(err.message);
                        });
                    }
                  }
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="h-8"></div>
      <Text>
        Select a link type, then choose to create a temporary or permanent
        invite link.
      </Text>
      <div className="h-2"></div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Select
          placeholder="Select link type"
          className="w-64"
          options={INVITE_LINK_OPTIONS}
          value={linkType}
          onSelect={setLinkType}
        ></Select>
        <Button
          variant="cta"
          disabled={!linkType}
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
          Create Temporary Link
        </Button>
        <Button
          variant="cta"
          disabled={!linkType}
          onClick={async () => {
            if (!linkType) {
              toast.error("Please select a link type");
              return;
            }

            const { data, error } = await createInviteLink({
              space_id: currentSpace.id,
              type: linkType,
              expires_at: null,
            });

            if (error) {
              toast.error(error.message);
            } else {
              toast.success("Invite link created");
              refetchInviteLinks();
            }
          }}
        >
          Create Permanent Link
        </Button>
      </div>
    </div>
  );
}
