import { useCallback } from "react";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../lib/firebase";

const googleOauthProvider = new GoogleAuthProvider();

export function useSignIn() {
  const signInWithGoogle = useCallback(() => {
    return signInWithPopup(auth, googleOauthProvider);
  }, []);

  return {
    signInWithGoogle,
  };
}
