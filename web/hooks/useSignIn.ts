import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback } from "react";
import { auth } from "../lib/firebase";

const googleOauthProvider = new GoogleAuthProvider();

export function useSignIn() {
  const afterSignIn = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken();
    return fetch(`/api/auth/upsertUserData`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    signInWithPopup(auth, googleOauthProvider).then(afterSignIn);
  }, [afterSignIn]);

  return {
    signInWithGoogle,
  };
}
