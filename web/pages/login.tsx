import { ReactNode, useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { Input } from "../components/atomic/Input";
import { TextInput } from "../components/inputs/TextInput";
import { useUserQuery } from "../generated/graphql";
import { BxlGoogle } from "../generated/icons/logos";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { handleError } from "../lib/error";
import { auth } from "../lib/firebase";
import { CustomPage } from "../types";

import { TwoThirdsPageLayout } from "./TwoThirdsPageLayout";

const LoginPage: CustomPage = () => {
  const { signInWithGoogle } = useSignIn();
  const [signingIn, setSigningIn] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();

  // determine where to redirect to after login
  const { redirectUsingQueryParam } = useRedirectUsingQueryParam();

  const [formData, setFormData] = useSetState({ email: "", password: "" });

  // prevent users from accessing login page if they are already logged in
  useEffect(() => {
    if (isLoggedIn) {
      redirectUsingQueryParam("/");
    }
  }, [isLoggedIn, redirectUsingQueryParam]);

  const googleSignIn = async () => {
    // sign in with google and upsert data to our DB
    setSigningIn(true);
    signInWithGoogle()
      .then(async (userCred) => {
        if (!userCred.user.emailVerified) {
          router.push("/verify", { query: router.query });
        } else {
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
          await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        handleError(e);
      })
      .finally(() => {
        setSigningIn(false);
      });
  };

  const signInManually = async (email: string, password: string) => {
    // sign in using firebase auth and upsert to our DB
    setSigningIn(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        if (!userCred.user.emailVerified) {
          router.push("/verify", { query: router.query });
        } else {
          const tokenResult = await userCred.user.getIdTokenResult();
          await fetch(`/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
            },
          });
          await redirectUsingQueryParam("/");
        }
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
    <div className="h-screen">
      {signingIn ? (
        <div>Signing in... </div>
      ) : isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <TwoThirdsPageLayout>
          <div className="h-full flex flex-col items-start justify-center px-16">
            <Text variant="heading2">Join Canopy</Text>
            <div className="h-8"></div>
            <button
              className="border rounded-md w-96 flex items-center justify-center py-2 gap-4 hover:bg-gray-50 transition active:translate-y-px"
              onClick={googleSignIn}
            >
              <BxlGoogle className="h-6 w-6" />
              Continue with Google
            </button>

            <div className="h-8"></div>
            <div className="w-96 flex items-center gap-4">
              <div className="flex-1 h-0.5 bg-gray-50"></div>
              <div className="text-gray-300">or</div>
              <div className="flex-1 h-0.5 bg-gray-50"></div>
            </div>
            <div className="h-8"></div>

            <TextInput
              className="w-96"
              label="Email"
              type="text"
              onChange={(e) => {
                setFormData({ email: e.target.value });
              }}
            />
            <div className="h-4"></div>

            <TextInput
              className="w-96"
              label="Password"
              type="password"
              onChange={(e) => {
                setFormData({ password: e.target.value });
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  signInManually(formData.email, formData.password);
                }
              }}
            />

            <div className="h-16"></div>
            <Button
              loading={signingIn}
              rounded
              onClick={(e) => {
                signInManually(formData.email, formData.password);
              }}
            >
              Login
            </Button>
            <div className="h-8"></div>
            <Text>
              Need an account?{" "}
              <a className="underline" href="/signup">
                Sign up
              </a>
            </Text>
            <div className="h-16"></div>
          </div>
        </TwoThirdsPageLayout>
      )}
    </div>
  );
};

LoginPage.requiresAuthentication = false;
export default LoginPage;
