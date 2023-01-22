import { z } from "zod";

import {
  executeGetProfilesQuery,
  executeGetSpaceQuery,
  executeUpdateSpaceMutation,
  Profile_Role_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const requestSchema = z.object({
  toProfileId: z.string(),
  spaceId: z.string(),
});

/**
 * Transfer [spaceId] ownership to [toProfileId]
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: requestSchema,
}).post(async (req, res) => {
  const { toProfileId, spaceId } = req.body;

  const { data: spaceData, error: spaceError } = await executeGetSpaceQuery({
    space_id: spaceId,
  });
  const space = spaceData?.space_by_pk;
  if (spaceError || !space) {
    throw makeApiFail(spaceError?.message ?? "No space found for ID");
  }

  const userId = req.token.uid;
  if (userId !== space.owner_id) {
    throw makeApiFail("Only the space owner can transfer ownership");
  }

  // Verify that the user is a member of the space.
  const { data: toProfileData } = await executeGetProfilesQuery({
    where: {
      id: { _eq: toProfileId },
    },
  });
  const toProfile = toProfileData?.profile[0];
  if (!toProfile) {
    throw makeApiFail("No profile found to transfer ownership to");
  }
  const roles = toProfile.flattened_profile_roles.map(
    (item) => item.profile_role
  );
  if (!roles.includes(Profile_Role_Enum.Member)) {
    throw makeApiFail(
      "Only members of this space can have ownership transferred to."
    );
  }

  // Transfer ownership
  const { data: updateSpaceData, error: updateSpaceError } =
    await executeUpdateSpaceMutation({
      space_id: spaceId,
      changes: {
        owner_id: toProfileId,
      },
    });
  if (updateSpaceError) {
    throw makeApiError(updateSpaceError.message);
  }
  if (!updateSpaceData?.update_space_by_pk?.id) {
    throw makeApiError("Failed to transfer ownership");
  }

  const response = makeApiSuccess({
    detail: "Success",
    spaceId: updateSpaceData.update_space_by_pk.id,
    newOwnerID: toProfileId,
  });
  res.status(response.code).json(response);
});
