import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { Button } from "../components/atomic/Button";
import { auth } from "../lib/firebase";
import { CustomPage } from "../types";
import { TextInput } from "../components/inputs/TextInput";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";

const signUpUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  return (
    <div>
      {isLoggedIn ? (
        <div>Redirecting...</div>
      ) : (
        <div className="w-full  max-w-lg rounded p-4 flex flex-wrap -mx-3">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <TextInput
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              onChange={(e) => {
                setFormData({ ...formData, firstName: e.target.value });
              }}
            />
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <TextInput
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              onChange={(e) => {
                setFormData({ ...formData, lastName: e.target.value });
              }}
            />
          </div>
          <div className="w-full md:w-full px-3 mb-6 md:mb-0">
            <TextInput
              label="Email"
              type="text"
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
            />
          </div>
          <div className="w-full md:w-full px-3 mb-12 md:mb-0">
            <TextInput
              label="Password"
              type="password"
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
            />
          </div>
          <div className="w-full md:w-full px-3 mb-6 md:mb-0 justify-center ">
            <Button
              onClick={(e) => {
                if (
                  formData.firstName.length >= 2 &&
                  formData.lastName.length >= 2
                ) {
                  signUpUser(
                    formData.firstName,
                    formData.lastName,
                    formData.email,
                    formData.password
                  );
                  router.push("/");
                } else {
                  alert("Please enter valid first and last name");
                }
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

SignUpPage.requiresAuthentication = false;
export default SignUpPage;
