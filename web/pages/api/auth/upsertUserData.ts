import { requireServerEnv } from "../../../server/env";
import { auth } from "../../../server/firebaseAdmin";
import { executeUpsertUserMutation } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiError, makeApiSuccess } from "../../../server/response";

export default applyMiddleware({
  authenticated: true,
}).post(async (req, res) => {
  await auth
    .getUser(req.token.uid)
    .then(async (user) => {
      const firstName = user.displayName?.split(" ")[0] ?? "";
      const lastName = user.displayName?.split(" ").slice(1).join(" ") ?? "";
      console.log("Begin upsertUserMutation");
      const { error } = await executeUpsertUserMutation({
        id: user.uid,
        email: user.email ?? "",
        first_name: firstName,
        last_name: lastName,
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
