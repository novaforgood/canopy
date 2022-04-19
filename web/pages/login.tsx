import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../components/atomic/Button";
import { useUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

export default function Login() {
  const { signInWithGoogle } = useSignIn();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  });

  return (
    <div className="p-4">
      {isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <Button
          onClick={() => {
            signInWithGoogle();
          }}
        >
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
