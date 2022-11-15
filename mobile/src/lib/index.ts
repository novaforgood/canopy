import { getCurrentUser } from "./firebase";
import { HOST_URL } from "./url";

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

        await fetch(`${HOST_URL}/api/auth/updateJwt`, {
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
    console.error(e);
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
