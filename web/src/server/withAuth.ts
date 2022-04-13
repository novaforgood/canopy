import { DecodedIdToken } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next/types";
import { auth } from "./firebaseAdmin";

export function withAuth<TResponseData>(
  handler: (
    req: NextApiRequest & { token: DecodedIdToken },
    res: NextApiResponse<TResponseData>
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<TResponseData>) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).end("Not authenticated. No Auth header");
    }

    let decodedToken: DecodedIdToken;
    try {
      const token = authHeader.split(" ")[1];
      decodedToken = await auth.verifyIdToken(token);
      if (!decodedToken || !decodedToken.uid)
        return res.status(401).end("Not authenticated");
    } catch (error) {
      return res.status(500).end("Error verifying token");
    }

    return handler(Object.assign(req, { token: decodedToken }), res);
  };
}
