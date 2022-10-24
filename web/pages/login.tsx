import { ReactNode, useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { getAdditionalUserInfo } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { Input } from "../components/atomic/Input";
import { TextInput } from "../components/inputs/TextInput";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { useUserQuery } from "../generated/graphql";
import { BxlGoogle } from "../generated/icons/logos";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { useUserData } from "../hooks/useUserData";
import { queryToString } from "../lib";
import { handleError } from "../lib/error";
import {
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
} from "../lib/firebase";
import { CustomPage } from "../types";

const LoginPage: CustomPage = () => {
  const [signingIn, setSigningIn] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);

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
    setSigningInWithGoogle(true);
    signInWithGoogle()
      .then(async (userCred) => {
        const isNewUser = getAdditionalUserInfo(userCred)?.isNewUser;

        if (isNewUser) {
          // User has never signed in before
          await userCred.user.delete();
          toast.error("Account not created yet. Please sign up first!");
        } else if (!userCred.user.emailVerified) {
          // User has signed in before but has not verified email
          router.push({ pathname: "/verify", query: router.query });
        } else {
          const idToken = await userCred.user.getIdToken();
          await fetch(`/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          });
          await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        toast.error(e.message);
        handleError(e);
      })
      .finally(() => {
        setSigningInWithGoogle(false);
      });
  };

  const signInManually = async (email: string, password: string) => {
    // sign in using firebase auth and upsert to our DB
    setSigningIn(true);
    signInWithEmailAndPassword(email, password)
      .then(async (userCred) => {
        if (!userCred.user.emailVerified) {
          router.push({ pathname: "/verify", query: router.query });
        } else {
          const tokenResult = await userCred.user.getIdTokenResult();
          await fetch(`/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
              "Content-Type": "application/json",
            },
          });
          await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        toast.error(e.code + ": " + e.message);
        signOut();
      })
      .finally(() => {
        setSigningIn(false);
      });
  };

  return (
    <div className="h-screen">
      {signingIn || signingInWithGoogle ? (
        <TwoThirdsPageLayout>
          <div className="flex h-screen flex-col items-start justify-center px-16">
            <Text variant="heading1">Signing in...</Text>
            {signingInWithGoogle && (
              <>
                <div className="h-8"></div>
                <Text>
                  Sign in to your Google account on the popup to complete login.
                </Text>
              </>
            )}
            <div className="h-40"></div>
          </div>
        </TwoThirdsPageLayout>
      ) : isLoggedIn ? (
        <TwoThirdsPageLayout>
          <div className="flex h-screen flex-col items-start justify-center px-16">
            <Text variant="heading1">Redirecting...</Text>
            <div className="h-40"></div>
          </div>
        </TwoThirdsPageLayout>
      ) : (
        <TwoThirdsPageLayout
          renderLeft={() => {
            return (
              <ImageSidebar
                imageSrc="/assets/sidebar/sidebar_trees_light.svg"
                imageAlt="trees"
                canGoBack={true}
              />
            );
          }}
        >
          <div className="flex h-full flex-col items-start justify-center px-6 text-green-900 sm:px-16">
            <Text variant="heading3">
              Login{router.query.redirect && " to continue"}
            </Text>
            <div className="h-8"></div>
            <button
              className="flex w-full items-center justify-center gap-4 rounded-md border py-2 transition hover:bg-gray-50 active:translate-y-px sm:w-96"
              onClick={googleSignIn}
            >
              <BxlGoogle className="h-6 w-6" />
              Continue with Google
            </button>

            <div className="h-8"></div>
            <div className="flex w-full select-none items-center gap-4 sm:w-96">
              <div className="h-0.5 flex-1 bg-gray-50"></div>
              <div className="text-gray-300">or</div>
              <div className="h-0.5 flex-1 bg-gray-50"></div>
            </div>
            <div className="h-8"></div>

            <div className="w-full sm:w-96">
              <TextInput
                label="Email"
                type="text"
                onChange={(e) => {
                  setFormData({ email: e.target.value });
                }}
              />
            </div>

            <div className="h-4"></div>

            <div className="w-full sm:w-96">
              <TextInput
                className="w-full sm:w-96"
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
            </div>

            <div className="h-4"></div>
            <Link href="/reset-password">
              <a>
                <Text variant="body2" className="text-gray-700 hover:underline">
                  Forgot your password?
                </Text>
              </a>
            </Link>

            <div className="h-8"></div>
            <Button
              loading={signingIn || signingInWithGoogle}
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
              <a
                className="underline"
                href={`/signup?${queryToString(router.query)}`}
              >
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

LoginPage.requiredAuthorizations = [];

export default LoginPage;
