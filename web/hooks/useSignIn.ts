import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback, useState } from "react";
import { auth } from "../lib/firebase";
import { useUserData } from "./useUserData";

const googleOauthProvider = new GoogleAuthProvider();

export function useSignIn() {
  const [signingIn, setSigningIn] = useState(false);

  const afterSignIn = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken();
    await fetch(`/api/auth/upsertUserData`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInWithPopup(auth, googleOauthProvider)
      .then(afterSignIn)
      .finally(() => {
        setSigningIn(false);
      });
  }, [afterSignIn]);

  return {
    signingIn,
    signInWithGoogle,
  };
}
