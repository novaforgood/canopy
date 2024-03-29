import { addYears, formatDistance } from "date-fns";

import { getCurrentUser } from "./firebase";

export const isServer = () => typeof window === "undefined";

export interface LoadSessionProps {
  spaceId?: string;
  forceUpdateJwt?: boolean;
}
export async function loadSession(props: LoadSessionProps | void) {
  const user = getCurrentUser();
  try {
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
    }
  } catch (e) {
    return null;
  }
  if (!user) {
    return null;
  } else {
    return {
      userId: user.uid,
      jwt: await user.getIdToken(),
    };
  }
}

export function queryToString(
  query: Record<string, string | string[] | undefined>
) {
  return Object.keys(query)
    .map((key) => `${key}=${query[key]?.toString()}`)
    .join("&");
}

export function getTimeRelativeToNow(date: Date) {
  return formatDistance(date, new Date(), { addSuffix: true });
}
