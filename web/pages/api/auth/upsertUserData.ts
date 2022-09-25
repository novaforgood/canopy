import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import { auth } from "../../../server/firebaseAdmin";
import { executeUpsertUserMutation } from "../../../server/generated/serverGraphql";
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
      const { error } = await executeUpsertUserMutation({
        id: user.uid,
        email: user.email ?? "",
        first_name: updateName ? firstName : undefined,
        last_name: updateName ? lastName : undefined,
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
