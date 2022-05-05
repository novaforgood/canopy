import { gql } from "urql";
import { z } from "zod";
import { auth } from "../../../server/firebaseAdmin";
import {
  executeGetInviteLinkQuery,
  executeInsertProfileMutation,
  GetInviteLinkDocument,
  Profile_Role_Enum,
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
  const expireDate = new Date(expires_at);

  if (expireDate < new Date()) {
    throw makeApiFail("Invite link has expired");
  }

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
        profile_roles: {
          data: [
            {
              profile_role: listingEnabled
                ? Profile_Role_Enum.MemberWhoCanList
                : Profile_Role_Enum.Member,
            },
          ],
        },
        listing_enabled: listingEnabled,
      },
    });
  if (insertError) {
    throw makeApiError(insertError.message);
  }

  const newProfileId = insertData?.insert_profile_one?.id;
  if (!newProfileId) {
    throw makeApiError("Failed to insert new profile");
  }

  const response = makeApiSuccess({ newProfileId });
  res.status(response.code).json(response);
});
