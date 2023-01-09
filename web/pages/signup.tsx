import { useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { getAdditionalUserInfo, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { Button, Input, Text } from "../components/atomic";
import { TextInput } from "../components/inputs/TextInput";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { BxlGoogle } from "../generated/icons/logos";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { queryToString } from "../lib";
import { handleError } from "../lib/error";
import {
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signOut,
} from "../lib/firebase";
import { CustomPage } from "../types";

const SignUpPage: CustomPage = () => {
  const [formData, setFormData] = useSetState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  const [loading, setLoading] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);

  const { redirectUsingQueryParam } = useRedirectUsingQueryParam();

  useEffect(() => {
    if (isLoggedIn) {
      redirectUsingQueryParam("/");
    }
  }, [isLoggedIn, redirectUsingQueryParam]);

  const signUp = async () => {
    if (!formData.firstName) {
      toast.error("First name is required");
      return;
    }
    if (!formData.lastName) {
      toast.error("Last name is required");
      return;
    }
    setLoading(true);

    const { email, password, firstName, lastName } = formData;

    // signup user with firebase and upsert to our DB
    // send email verification
    return createUserWithEmailAndPassword(email, password)
      .then(async (userCred) => {
        const isNewUser = getAdditionalUserInfo(userCred)?.isNewUser;

        if (!isNewUser) {
          // If not a new user, sign them out and tell them to log in
          toast.error(
            "Account already exists under this email. Please log in."
          );
          await signOut();
        } else {
          const user = userCred.user;
          const tokenResult = await user.getIdTokenResult();
          const name = `${firstName} ${lastName}`;
          await updateProfile(user, {
            displayName: name,
          });

          if (userCred.user.emailVerified) {
            await fetch(`/api/auth/upsertUserData`, {
              method: "POST",
              headers: {
                authorization: `Bearer ${tokenResult.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ updateName: true }),
            }).then(() => {
              return redirectUsingQueryParam("/");
            });
          } else {
            console.log(router.query);
            await router.push({ pathname: "/verify", query: router.query });
          }
        }
      })
      .catch((e) => {
        if (e.message.includes("already-in-use")) {
          toast.error(
            "Account already exists under this email. Please log in."
          );
        } else {
          toast.error(e.message);
          handleError(e);
        }
        signOut();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="h-screen">
      {isLoggedIn ? (
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
                imageSrc="/assets/sidebar/sidebar_trees_dark.svg"
                imageAlt="trees"
                canGoBack={true}
              />
            );
          }}
        >
          <div className="flex h-full flex-col items-start justify-center px-6 text-green-900 sm:px-16">
            <Text variant="heading3">
              Sign up{router.query.redirect && " to continue"}
            </Text>
            <div className="h-8"></div>
            <button
              className="flex w-full items-center justify-center gap-4 rounded-md border py-2 transition hover:bg-gray-50 active:translate-y-px sm:w-96"
              onClick={() => {
                setSigningInWithGoogle(true);
                signInWithGoogle()
                  .then(async (userCred) => {
                    const isNewUser =
                      getAdditionalUserInfo(userCred)?.isNewUser;

                    if (isNewUser) {
                      const idToken = await userCred.user.getIdToken();
                      fetch(`/api/auth/upsertUserData`, {
                        method: "POST",
                        headers: {
                          authorization: `Bearer ${idToken}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ updateName: true }),
                      }).then(() => {
                        redirectUsingQueryParam("/");
                      });
                    } else {
                      // User already has an account
                      toast.error(
                        "An account with this email already exists. Please log in."
                      );
                      signOut();
                    }
                  })
                  .catch((e) => {
                    toast.error(e.message);
                    handleError(e);
                  })
                  .finally(() => {
                    setSigningInWithGoogle(false);
                  });
              }}
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

            <div className="flex w-full flex-col gap-4 sm:w-96">
              <div className="flex gap-4">
                <TextInput
                  className="w-full"
                  label="First Name"
                  type="text"
                  placeholder=""
                  onChange={(e) => {
                    setFormData({ firstName: e.target.value });
                  }}
                />
                <TextInput
                  className="w-full"
                  label="Last Name"
                  type="text"
                  placeholder=""
                  onChange={(e) => {
                    setFormData({ lastName: e.target.value });
                  }}
                />
              </div>

              <TextInput
                className="w-full"
                label="Email"
                type="text"
                onChange={(e) => {
                  setFormData({ email: e.target.value });
                }}
              />
              <TextInput
                className="w-full"
                label="Password"
                type="password"
                onChange={(e) => {
                  setFormData({ password: e.target.value });
                }}
                onKeyUp={async (e) => {
                  if (e.key === "Enter") {
                    signUp();
                  }
                }}
              />
            </div>
            <div className="h-6"></div>
            <div className="w-96">
              <Text className="text-gray-600" variant="body2">
                By creating an account, you agree to our{" "}
                <Link href="/privacy" passHref>
                  <a className="text-green-900 underline" target="_blank">
                    Privacy Policy
                  </a>
                </Link>{" "}
                and{" "}
                <Link href="/terms" passHref>
                  <a className="text-green-900 underline" target="_blank">
                    Terms of Use
                  </a>
                </Link>
                .
              </Text>
            </div>
            <div className="h-8"></div>
            <Button
              rounded
              loading={loading}
              onClick={async (e) => {
                signUp();
              }}
            >
              Create account
            </Button>
            <div className="h-8"></div>
            <Text>
              Already have an account?{" "}
              <a
                className="underline"
                href={`/login?${queryToString(router.query)}`}
              >
                Login
              </a>
            </Text>
            <div className="h-16"></div>
          </div>
        </TwoThirdsPageLayout>
      )}
    </div>
  );
};

SignUpPage.requiredAuthorizations = [];

export default SignUpPage;
