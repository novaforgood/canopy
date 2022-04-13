import { auth } from "../../src/server/firebaseAdmin";
import { withAuth } from "../../src/server/withAuth";

type ResponseData = {
  detail: string;
};

export default withAuth<ResponseData>(async (req, res) => {
  await auth.setCustomUserClaims(req.token.uid, {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": req.token.uid,
    },
  });
  res.status(200).json({ detail: "Successful" });
});
