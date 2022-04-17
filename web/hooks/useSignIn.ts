import { useCallback } from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { requireEnv } from "../lib/env";
import { auth } from "../lib/firebase";

export function useSignIn() {
  const [_signInWithGoogle] = useSignInWithGoogle(auth);

  const afterSignIn = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken();
    return fetch(`/api/auth/upsertUserData`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    _signInWithGoogle().then(afterSignIn);
  }, [_signInWithGoogle, afterSignIn]);

  return {
    signInWithGoogle,
  };
}
