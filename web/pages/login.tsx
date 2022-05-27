import { useSetState } from "@mantine/hooks";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { useUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { handleError } from "../lib/error";
import { auth } from "../lib/firebase";
import { CustomPage } from "../types";

const LoginPage: CustomPage = () => {
  const { signInWithGoogle } = useSignIn();
  const [signingIn, setSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();
  const [paths, _] = useState(router.asPath.split("redirect="));
  const redirect = paths.length > 1 ? paths[1] : "/";
  console.log("paths", paths);
  console.log("REDIRECT: ", redirect);

  const [formData, setFormData] = useSetState({ email: "", password: "" });

  const googleSignIn = async () => {
    setSigningIn(true);
    setIsLoading(true);

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
        await router.push(redirect);
      })
      .catch((e) => {
        handleError(e);
      })
      .finally(() => {
        setIsLoading(true);
        setSigningIn(false);
      });
  };

  const signInManually = async (email: string, password: string) => {
    setSigningIn(true);
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        const tokenResult = await userCred.user.getIdTokenResult();
        await fetch(`/api/auth/upsertUserData`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${tokenResult.token}`,
          },
        });
        await router.push(redirect);
      })
      .catch((e) => {
        toast.error(e.code + ": " + e.message);
        signOut(auth);
      })
      .finally(() => {
        setSigningIn(false);
      });
  };

  return (
    <div className="p-4">
      {userData && !isLoading ? (
        <Button onClick={() => router.push("/")}>Go Home</Button>
      ) : signingIn ? (
        <div>Signing in... </div>
      ) : isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <>
          <Button onClick={googleSignIn}>Sign in with Google</Button>
          <div className="py-3">
            <label
              className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              className="appearance-none block w-1/2 bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3"
              id="email"
              type="text"
              onChange={(e) => {
                setFormData({ email: e.target.value });
              }}
            />
            <label
              className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              className="appearance-none block w-1/2 bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3"
              id="password"
              type="password"
              onChange={(e) => {
                setFormData({ password: e.target.value });
              }}
            />
            <Button
              onClick={(e) => {
                signInManually(formData.email, formData.password);
              }}
            >
              Login
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

LoginPage.requiresAuthentication = false;
export default LoginPage;
