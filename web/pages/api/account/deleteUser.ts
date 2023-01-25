import { z } from "zod";

import { auth } from "../../../server/firebaseAdmin";
import {
  executeDeleteProfileListingsWithProfileIdMutation,
  executeGetSpaceQuery,
  executeUpdateProfileMutation,
  executeUpdateUserMutation,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const requestSchema = z.object({
  userId: z.string(),
});

/**
 * Delete specified profile.
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: requestSchema,
}).post(async (req, res) => {
  const { userId: intendedUserId } = req.body;
  const userId = req.token.uid;
  if (userId !== intendedUserId) {
    throw makeApiFail("You can only delete your own account");
  }

  // Delete sensitive information from the user record
  // Retain e-mail address for a period of time for security purposes
  const { data: deleteListingData, error: deleteListingError } =
    await executeUpdateUserMutation({
      user_id: userId,
      changes: {
        deleted: true,
        first_name: null,
        last_name: null,
      },
    });
  if (deleteListingError || !deleteListingData?.update_user_by_pk) {
    throw makeApiError(deleteListingError?.message ?? "Failed to delete user");
  }

  // Delete user from firebase
  await auth.deleteUser(userId).catch((error) => {
    throw makeApiError(error.message);
  });

  const response = makeApiSuccess({
    detail: "Success",
    deletedUserId: userId,
  });
  res.status(response.code).json(response);
});
