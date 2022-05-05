import { auth } from "firebase-admin";
import { executeUpsertUserMutation } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

export default applyMiddleware({
  authenticated: true,
}).post(async (req, res) => {
  auth()
    .getUser(req.token.uid)
    .then(async (user) => {
      await executeUpsertUserMutation({
        id: user.uid,
        email: user.email ?? "",
        first_name: user.displayName?.split(" ")[0] ?? "",
        last_name: user.displayName?.split(" ")[1] ?? "",
      });
    });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
