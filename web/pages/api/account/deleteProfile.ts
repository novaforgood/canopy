import { z } from "zod";

import {
  executeDeleteProfileListingsWithProfileIdMutation,
  executeGetSpaceQuery,
  executeUpdateProfileMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const requestSchema = z.object({
  profileId: z.string(),
});

/**
 * Delete specified profile.
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: requestSchema,
}).post(async (req, res) => {
  const { profileId: intendedProfileId } = req.body;
  if (!req.callerProfile) {
    throw makeApiFail("No caller profile");
  }
  if (req.callerProfile.id !== intendedProfileId) {
    throw makeApiFail("Only the profile owner can delete their profile");
  }

  const spaceId = req.callerProfile.space.id;

  const { data: spaceData, error: spaceError } = await executeGetSpaceQuery({
    space_id: spaceId,
  });
  const space = spaceData?.space_by_pk;
  if (spaceError || !space) {
    throw makeApiFail(spaceError?.message ?? "No space found for ID");
  }

  const userId = req.token.uid;
  if (userId === space.owner_id) {
    throw makeApiFail(
      "As space owner, you must either delete the space or transfer ownership"
    );
  }
  if (req.callerProfile.space.id !== spaceId) {
    throw makeApiFail("You are not a member of this space");
  }

  // Delete profile listings associated with this profile
  const { data: deleteListingData, error: deleteListingError } =
    await executeDeleteProfileListingsWithProfileIdMutation({
      profile_id: req.callerProfile.id,
    });
  if (deleteListingError) {
    throw makeApiError(deleteListingError.message);
  }
  if (!deleteListingData?.delete_profile_listing) {
    throw makeApiError("Failed to delete profile listings");
  }

  // Unlink profile from userId
  const { data: updateProfileData, error: updateProfileError } =
    await executeUpdateProfileMutation({
      profile_id: req.callerProfile.id,
      changes: {
        user_id: null,
      },
    });
  if (updateProfileError) {
    throw makeApiError(updateProfileError.message);
  }
  if (!updateProfileData?.update_profile_by_pk?.id) {
    throw makeApiError("Failed to delete profile");
  }

  const response = makeApiSuccess({
    detail: "Success",
    deletedProfileId: updateProfileData.update_profile_by_pk.id,
  });
  res.status(response.code).json(response);
});
