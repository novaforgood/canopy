import { User } from "firebase/auth";
import { useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { requireEnv } from "../lib/env";
import { auth } from "../lib/firebase";

export function useAuth() {
  const handleUserChanged = useCallback(async (user: User | null) => {
    if (!user) return;
    const tokenResult = await user.getIdTokenResult();
    const claims = tokenResult.claims["https://hasura.io/jwt/claims"];
    if (claims) return;

    // New user has logged in but doesn't have JWT claims
    await fetch(`${requireEnv("NEXT_PUBLIC_API_PREFIX")}/updateJwt`, {
      headers: {
        authorization: `Bearer ${tokenResult.token}`,
      },
    });
    await auth.currentUser?.getIdToken(true);
  }, []);

  const [user, loading, error] = useAuthState(auth, {
    onUserChanged: handleUserChanged,
  });

  return {
    user,
    loading,
    error,
  };
}
