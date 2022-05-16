import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

import { Button } from "../components/atomic/Button";
import { useUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { handleError } from "../lib/error";
import { auth } from "../lib/firebase";

export default function Login() {
  const { signInWithGoogle } = useSignIn();
  const [signingIn, setSigningIn] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();

  useEffect(() => {
    if (userData) {
      router.push("/");
    }
  }, [userData, router]);

  return (
    <div className="p-4">
      {signingIn ? (
        <div>Signing in... </div>
      ) : isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <Button
          onClick={() => {
            setSigningIn(true);
            signInWithGoogle()
              .then(async () => {
                const user = await auth.currentUser;
                if (!user) {
                  throw new Error("Could not get user after sign-in");
                }
                const idToken = await user.getIdToken();
                await fetch(`/api/auth/upsertUserData`, {
                  method: "POST",
                  headers: {
                    authorization: `Bearer ${idToken}`,
                  },
                });
                router.push("/");
              })
              .catch((e) => {
                handleError(e);
              })
              .finally(() => {
                setSigningIn(false);
              });
          }}
        >
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
