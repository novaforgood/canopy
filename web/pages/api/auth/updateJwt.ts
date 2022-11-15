import { z } from "zod";

import { auth } from "../../../server/firebaseAdmin";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";

export default applyMiddleware({
  authenticated: true,
  validationSchema: z.object({
    spaceId: z.string().optional(),
  }),
}).post(async (req, res) => {
  console.log(req.body.spaceId);
  console.log("Ligma");
  await auth
    .setCustomUserClaims(req.token.uid, {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-id": req.token.uid,
        "x-hasura-space-id": req.body.spaceId ?? PLACEHOLDER_UUID,
      },
    })
    .catch((e) => {
      console.log(e);
    });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
