import { z } from "zod";

import {
  executeGetInviteLinkQuery,
  executeGetSpaceQuery,
  executeInsertProfileMutation,
  Profile_Constraint,
  Profile_Role_Enum,
  Profile_Update_Column,
  Space_Invite_Link_Type_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: z.object({
    inviteLinkId: z.string(),
  }),
}).post(async (req, res) => {
  // Fetch invite link info from the database
  const { inviteLinkId } = req.body;
  const { data: inviteLinkData, error: inviteLinkError } =
    await executeGetInviteLinkQuery({ invite_link_id: inviteLinkId });
  if (inviteLinkError) {
    throw makeApiFail(inviteLinkError.message);
  }
  const inviteLink = inviteLinkData?.space_invite_link_by_pk;
  if (!inviteLink) {
    throw makeApiFail("Invite link not found");
  }

  // Check if invite link has expired
  const { expires_at } = inviteLink;
  const expireDate = expires_at ? new Date(expires_at) : null;

  if (expireDate && expireDate < new Date()) {
    throw makeApiFail("Invite link has expired");
  }

  // Check if user's email matches the space's domain whitelist
  const { data: spaceData, error: spaceError } = await executeGetSpaceQuery({
    space_id: inviteLink.space_id,
  });
  if (spaceError) {
    throw makeApiError(spaceError.message);
  }
  const space = spaceData?.space_by_pk;
  if (!space) {
    throw makeApiError("Space not found");
  }
  const { attributes } = space;

  const { email } = req.token;

  const domainWhitelist = attributes.domainWhitelist;
  if (domainWhitelist && email) {
    if (!email.endsWith(domainWhitelist)) {
      throw makeApiFail(`Your email is not allowed to join this space`);
    }
  }

  const shouldEnableChatIntros = !!attributes.optUsersInToMatchesByDefault;

  // If not expired, accept invite link and add user to program
  const listingEnabled =
    inviteLink.type === Space_Invite_Link_Type_Enum.MemberListingEnabled
      ? true
      : false;
  const { error: insertError, data: insertData } =
    await executeInsertProfileMutation({
      data: {
        user_id: req.token.uid,
        space_id: inviteLink.space_id,
        attributes: {
          enableChatIntros: shouldEnableChatIntros,
        },
        profile_roles: {
          data: [
            {
              profile_role: listingEnabled
                ? Profile_Role_Enum.MemberWhoCanList
                : Profile_Role_Enum.Member,
            },
          ],
        },
      },
      on_conflict: {
        constraint: Profile_Constraint.ProfilesPkey,
        update_columns: [Profile_Update_Column.Id],
      },
    });
  if (insertError) {
    throw makeApiError(insertError.message);
  }

  const newProfileId = insertData?.insert_profile_one?.id;
  if (!newProfileId) {
    throw makeApiError("Failed to insert new profile");
  }

  const response = makeApiSuccess({ newProfileId, inviteLink: inviteLink });
  res.status(response.code).json(response);
});
