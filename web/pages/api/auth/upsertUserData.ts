import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import { auth } from "../../../server/firebaseAdmin";
import {
  executeUpsertUserMutation,
  User_Update_Column,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiError, makeApiSuccess } from "../../../server/response";

export default applyMiddleware({
  authenticated: true,
  validationSchema: z.object({
    updateName: z.boolean().optional(),
  }),
}).post(async (req, res) => {
  const { updateName = false } = req.body;
  await auth
    .getUser(req.token.uid)
    .then(async (user) => {
      const firstName = user.displayName?.split(" ")[0] ?? "";
      const lastName = user.displayName?.split(" ").slice(1).join(" ") ?? "";

      const updateColumns = [User_Update_Column.Email];

      if (updateName) {
        updateColumns.push(User_Update_Column.FirstName);
        updateColumns.push(User_Update_Column.LastName);
      }

      const { error } = await executeUpsertUserMutation({
        id: user.uid,
        email: user.email ?? "",
        first_name: firstName,
        last_name: lastName,
        last_active_at: new Date().toISOString(),
        update_columns: updateColumns,
      });
      if (error) {
        console.log(error.message);
        throw makeApiError(error.message);
      }
    })
    .catch((e) => {
      throw makeApiError(e.message);
    });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
