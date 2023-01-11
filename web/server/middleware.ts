import { DecodedIdToken } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next";
import nc, { Middleware } from "next-connect";
import { z, ZodType } from "zod";

import { auth } from "./firebaseAdmin";
import {
  executeGetProfilesQuery,
  GetProfilesQuery,
  Profile_Role_Enum,
} from "./generated/serverGraphql";
import { makeApiFail } from "./response";

type Profile = GetProfilesQuery["profile"][number];

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

    // If x-hasura-space-id is provided, fetch profile
    let callerProfile: Profile | undefined = undefined;
    const spaceId: string | undefined =
      decodedToken["https://hasura.io/jwt/claims"]?.["x-hasura-space-id"];
    if (spaceId) {
      const { data: callerUserData } = await executeGetProfilesQuery({
        where: {
          space_id: { _eq: spaceId },
          user_id: { _eq: decodedToken.uid },
        },
      });
      callerProfile = callerUserData?.profile[0];
    }

    Object.assign(req, { token: decodedToken, callerProfile });
    next();
  };
}

function authorizationMiddleware(
  requiredRoles: Profile_Role_Enum[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Middleware<CustomApiRequest<true, any>, NextApiResponse> {
  return async (req, res, next) => {
    const callerProfile = req.callerProfile;
    if (!callerProfile) {
      throw makeApiFail("Caller profile is undefined");
    }

    const roles = callerProfile.flattened_profile_roles.map(
      (item) => item.profile_role
    );
    for (const requiredRole of requiredRoles) {
      if (!roles.includes(requiredRole)) {
        throw makeApiFail(
          `Caller does not have role: ${requiredRole} in space ${callerProfile.space.id}`
        );
      }
    }

    next();
  };
}

type MiddlewareOptions<TAuth extends boolean, TValidation extends ZodType> = {
  authenticated: TAuth;
  validationSchema?: TValidation;
} & (TAuth extends true
  ? { authorizationsInSpace?: Profile_Role_Enum[] }
  : { authorizationsInSpace?: null });

type CustomApiRequest<
  TAuth extends boolean,
  TValidation extends ZodType
> = Omit<NextApiRequest, "token" | "body"> &
  (TAuth extends true
    ? { token: DecodedIdToken; callerProfile?: Profile }
    : Record<string, never>) &
  (TValidation extends undefined
    ? Record<string, never>
    : { body: z.infer<TValidation> });

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

    // Only run if user is authenticated
    if (options.authorizationsInSpace) {
      middleware = middleware.use(
        authorizationMiddleware(options.authorizationsInSpace)
      );
    }
  }

  if (options.validationSchema) {
    middleware = middleware.use(validateMiddleware(options.validationSchema));
  }

  return middleware;
}
