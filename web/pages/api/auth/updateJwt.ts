import { auth } from "../../../server/firebaseAdmin";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";
import { withAuth } from "../../../server/withAuth";

type ResponseData = {
  detail: string;
};

export default applyMiddleware({ authenticated: true }).get(
  async (req, res) => {
    await auth.setCustomUserClaims(req.token.uid, {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-id": req.token.uid,
      },
    });

    const response = makeApiSuccess({ detail: "Successful" });
    res.status(response.code).json(response);
  }
);
