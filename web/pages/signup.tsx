import { useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { TextInput } from "../components/inputs/TextInput";
import { BxlGoogle } from "../generated/icons/logos";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { auth } from "../lib/firebase";
import { CustomPage } from "../types";

import { TwoThirdsPageLayout } from "./TwoThirdsPageLayout";

const signUpUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  // signup user with firebase and upsert to our DB
  // send email verification
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCred) => {
      const user = userCred.user;
      const tokenResult = await user.getIdTokenResult();
      const name = `${firstName} ${lastName}`;
      await updateProfile(user, {
        displayName: name,
      });
      await fetch(`/api/auth/upsertUserData`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenResult.token}`,
        },
      });
      await sendEmailVerification(user);
    })
    .catch((e) => {
      toast.error(e.code + ": " + e.message);
      signOut(auth);
    });
};

const SignUpPage: CustomPage = () => {
  const [formData, setFormData] = useSetState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="h-screen">
      {isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <TwoThirdsPageLayout>
          <div className="h-full flex flex-col items-start justify-center px-16">
            <Text variant="heading2">Join Canopy</Text>
            <div className="h-8"></div>
            <button
              className="border rounded-md w-96 flex items-center justify-center py-2 gap-4 hover:bg-gray-50 transition active:translate-y-px"
              onClick={() => {}}
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
              />
            </div>

            <div className="h-8"></div>
            <Button
              rounded
              onClick={(e) => {
                // signInManually(formData.email, formData.password);
              }}
            >
              Create account
            </Button>
            <div className="h-8"></div>
            <Text>
              Already have an account?{" "}
              <a className="underline" href="/login">
                Login
              </a>
            </Text>
            <div className="h-16"></div>
          </div>
        </TwoThirdsPageLayout>
        // <div className="w-full  max-w-lg rounded p-4 flex flex-wrap -mx-3">
        //   <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        //     <TextInput
        //       label="First Name"
        //       type="text"
        //       placeholder="Enter your first name"
        //       onChange={(e) => {
        //         setFormData({ firstName: e.target.value });
        //       }}
        //     />
        //   </div>
        //   <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        //     <TextInput
        //       label="Last Name"
        //       type="text"
        //       placeholder="Enter your last name"
        //       onChange={(e) => {
        //         setFormData({ lastName: e.target.value });
        //       }}
        //     />
        //   </div>
        //   <div className="w-full md:w-full px-3 mb-6 md:mb-0">
        //     <TextInput
        //       label="Email"
        //       type="text"
        //       onChange={(e) => {
        //         setFormData({ email: e.target.value });
        //       }}
        //     />
        //   </div>
        //   <div className="w-full md:w-full px-3 mb-12 md:mb-0">
        //     <TextInput
        //       label="Password"
        //       type="password"
        //       onChange={(e) => {
        //         setFormData({ password: e.target.value });
        //       }}
        //     />
        //   </div>
        //   <div className="w-full md:w-full px-3 mb-6 md:mb-0 justify-center ">
        //     <Button
        //       onClick={(e) => {
        //         if (
        //           formData.firstName.length >= 2 &&
        //           formData.lastName.length >= 2
        //         ) {
        //           signUpUser(
        //             formData.firstName,
        //             formData.lastName,
        //             formData.email,
        //             formData.password
        //           );
        //           router.push("/");
        //         } else {
        //           alert("Please enter valid first and last name");
        //         }
        //       }}
        //     >
        //       Submit
        //     </Button>
        //   </div>
        // </div>
      )}
    </div>
  );
};

SignUpPage.requiresAuthentication = false;
export default SignUpPage;
