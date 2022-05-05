import { gql } from "urql";
import { executeUpsertUserMutation } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

export default applyMiddleware({
  authenticated: true,
}).get(async (req, res) => {
  await executeUpsertUserMutation({
    id: req.token.uid,
    email: req.token.email ?? "",
  });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
