import { getCurrentUser } from "./firebase";

export const isServer = () => typeof window === "undefined";

export async function loadSession(
  props: { spaceId?: string; forceUpdateJwt?: boolean } | void
) {
  try {
    const user = getCurrentUser();
    if (user) {
      const tokenResult = await user.getIdTokenResult();
      const claims = tokenResult.claims["https://hasura.io/jwt/claims"];

      if (!claims || props?.forceUpdateJwt) {
        // New user has logged in but doesn't have JWT claims

        await fetch(`/api/auth/updateJwt`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${tokenResult.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ spaceId: props?.spaceId }),
        });
        await user.getIdToken(true);
      }
      return {
        userId: user.uid,
        jwt: await user.getIdToken(),
      };
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export function queryToString(
  query: Record<string, string | string[] | undefined>
) {
  return Object.keys(query)
    .map((key) => `${key}=${query[key]?.toString()}`)
    .join("&");
}
