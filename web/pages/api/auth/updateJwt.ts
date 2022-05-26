import { z } from "zod";

import { auth } from "../../../server/firebaseAdmin";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

export default applyMiddleware({
  authenticated: true,
  validationSchema: z.object({
    spaceId: z.string().optional(),
  }),
}).post(async (req, res) => {
  await auth
    .setCustomUserClaims(req.token.uid, {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-id": req.token.uid,
        "x-hasura-space-id": req.body.spaceId,
      },
    })
    .catch((e) => {
      console.log(e);
    });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
