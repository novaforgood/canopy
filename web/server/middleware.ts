import { DecodedIdToken } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next";
import nc, { Middleware } from "next-connect";
import { z, ZodType } from "zod";
import { auth } from "./firebaseAdmin";
import { makeApiFail } from "./response";

function validateMiddleware<T>(
  schema: z.Schema<T>
): Middleware<NextApiRequest, NextApiResponse> {
  return async (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      Object.assign(req, { body: result.data });
      next();
    } else {
      throw makeApiFail(result.error.message);
    }
  };
}

function authMiddleware(): Middleware<NextApiRequest, NextApiResponse> {
  return async (req, res, next) => {
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

    Object.assign(req, { token: decodedToken });
    next();
  };
}

interface MiddlewareOptions<TAuth extends boolean, TValidation> {
  authenticated: TAuth;
  validationSchema?: TValidation;
}

type CustomApiRequest<
  TAuth extends boolean,
  TValidation extends ZodType
> = Omit<NextApiRequest, "token" | "body"> &
  (TAuth extends true ? { token: DecodedIdToken } : {}) &
  (TValidation extends undefined ? {} : { body: z.infer<TValidation> });

export function applyMiddleware<
  TAuth extends boolean,
  TValidation extends ZodType
>(options: MiddlewareOptions<TAuth, TValidation>) {
  let middleware = nc<CustomApiRequest<TAuth, TValidation>, NextApiResponse>({
    onError: (e, req, res) => {
      res
        .status(e.code ?? 500)
        .json({ code: e.code ?? 500, message: e.message ?? "Unknown error" });
    },
  });

  if (options.authenticated) {
    middleware = middleware.use(authMiddleware());
  }

  if (options.validationSchema) {
    middleware = middleware.use(validateMiddleware(options.validationSchema));
  }

  return middleware;
}
