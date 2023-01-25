import { z } from "zod";

import {
  executeGetSpaceQuery,
  executeUpdateSpaceMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const requestSchema = z.object({
  spaceId: z.string(),
});

/**
 * Delete a space
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: requestSchema,
}).post(async (req, res) => {
  const { spaceId } = req.body;

  const { data: spaceData, error: spaceError } = await executeGetSpaceQuery({
    space_id: spaceId,
  });
  const space = spaceData?.space_by_pk;
  if (spaceError || !space) {
    throw makeApiFail(spaceError?.message ?? "No space found for ID");
  }

  const userId = req.token.uid;
  if (userId !== space.owner_id) {
    throw makeApiFail("Only the space owner can delete the space");
  }

  // Delete the space
  const { data: updateSpaceData, error: updateSpaceError } =
    await executeUpdateSpaceMutation({
      space_id: spaceId,
      changes: {
        deleted: true,
      },
    });
  if (updateSpaceError) {
    throw makeApiError(updateSpaceError.message);
  }
  if (!updateSpaceData?.update_space_by_pk?.id) {
    throw makeApiError("Failed to delete space");
  }

  const response = makeApiSuccess({
    detail: "Success",
    spaceId: updateSpaceData.update_space_by_pk.id,
  });
  res.status(response.code).json(response);
});
