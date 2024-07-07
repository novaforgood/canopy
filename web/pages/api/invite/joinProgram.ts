import { z } from "zod";

import {
  executeGetInviteLinkQuery,
  executeGetProfileQuery,
  executeGetProfilesQuery,
  executeGetSpaceQuery,
  executeInsertProfileMutation,
  executeUpdateProfileMutation,
  executeUpdateProfileRoleRowMutation,
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

  const domainWhitelists = attributes.domainWhitelists as string[] | undefined;
  if (email) {
    if (domainWhitelists) {
      if (!domainWhitelists.some((domain) => email.endsWith(domain))) {
        throw makeApiFail(
          `Your email, ${email}, is not allowed to join this space`
        );
      }
    }
  }

  // Determine profile metadata
  const shouldEnableChatIntros = !!attributes.optUsersInToMatchesByDefault;
  const listingEnabled =
    inviteLink.type === Space_Invite_Link_Type_Enum.MemberListingEnabled
      ? true
      : false;

  const newProfileRole = listingEnabled
    ? Profile_Role_Enum.MemberWhoCanList
    : Profile_Role_Enum.Member;

  // Check for existing profile
  const rawProfileData = await executeGetProfilesQuery({
    where: {
      user_id: { _eq: req.token.uid },
      space_id: { _eq: inviteLink.space_id },
    },
  });
  const existingProfile = rawProfileData.data?.profile[0];
  if (existingProfile) {
    // If user profile exists but is archived, unarchive it.
    const archivedRoleRowEntry = existingProfile.profile_roles.find(
      (role) => role.profile_role === Profile_Role_Enum.Archived
    );
    if (archivedRoleRowEntry) {
      await executeUpdateProfileRoleRowMutation({
        row_id: archivedRoleRowEntry.id,
        profile_role: newProfileRole,
      });

      const response = makeApiSuccess({
        newProfileId: existingProfile.id,
        inviteLink: inviteLink,
      });
      res.status(response.code).json(response);
      return;
    } else {
      throw makeApiFail("Profile already exists and is not archived.");
    }
  } else {
    // If not expired, accept invite link and add user to program
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
                profile_role: newProfileRole,
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
  }
});
