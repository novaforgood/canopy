import { useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { TextInput } from "../components/inputs/TextInput";
import { TwoThirdsPageLayout } from "../components/TwoThirdsPageLayout";
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
        const { creationTime, lastSignInTime } = userCred.user.metadata;
        const isNewUser = creationTime === lastSignInTime;
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
              },
            });
            await redirectUsingQueryParam("/");
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
        <div>Redirecting...</div>
      ) : (
        <TwoThirdsPageLayout>
          <div className="h-full flex flex-col items-start justify-center px-16">
            <Text variant="heading3">
              Sign up{router.query.redirect && " to continue"}
            </Text>
            <div className="h-8"></div>
            <button
              className="border rounded-md w-96 flex items-center justify-center py-2 gap-4 hover:bg-gray-50 transition active:translate-y-px"
              onClick={() => {
                setSigningInWithGoogle(true);
                signInWithGoogle()
                  .then(async (userCred) => {
                    const isNewUser =
                      userCred.user.metadata.creationTime ===
                      userCred.user.metadata.lastSignInTime;

                    if (isNewUser) {
                      const idToken = await userCred.user.getIdToken();
                      await fetch(`/api/auth/upsertUserData`, {
                        method: "POST",
                        headers: {
                          authorization: `Bearer ${idToken}`,
                        },
                      });
                      await redirectUsingQueryParam("/");
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
            <div className="w-96 flex items-center gap-4 select-none">
              <div className="flex-1 h-0.5 bg-gray-50"></div>
              <div className="text-gray-300">or</div>
              <div className="flex-1 h-0.5 bg-gray-50"></div>
            </div>
            <div className="h-8"></div>

            <div className="flex flex-col gap-4 w-96">
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
                    await signUp();
                  }
                }}
              />
            </div>

            <div className="h-8"></div>
            <Button
              rounded
              loading={loading}
              onClick={async (e) => {
                await signUp();
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
