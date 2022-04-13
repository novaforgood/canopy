import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../server/firebaseAdmin";

type ResponseData = {
  detail: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).end("Not authenticated. No Auth header");
  }

  let decodedToken;
  try {
    const token = authHeader.split(" ")[1];
    decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken || !decodedToken.uid)
      return res.status(401).end("Not authenticated");
  } catch (error) {
    return res.status(500).end("Error verifying token");
  }

  await auth.setCustomUserClaims(decodedToken.uid, {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": decodedToken.uid,
    },
  });

  res.status(200).json({ detail: "Successful" });
}
