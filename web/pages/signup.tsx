import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { Router, useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { auth } from "../lib/firebase";

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

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  return (
    <div className="w-full  max-w-lg rounded p-4 flex flex-wrap -mx-3">
      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        <label
          className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
          htmlFor="grid-first-name"
        >
          First Name
        </label>
        <Input
          id="grid-first-name"
          type="text"
          placeholder="Enter your first name"
          className={
            "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3"
          }
          onChange={(e) => {
            setFormData({ ...formData, firstName: e.target.value });
          }}
        />
      </div>
      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        <label
          className="block uppercase text-slate-800 text-sm font-bold mb-2"
          htmlFor="grid-last-name"
        >
          Last Name
        </label>
        <Input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 "
          id="grid-last-name"
          type="text"
          placeholder="Enter your last name"
          onChange={(e) => {
            setFormData({ ...formData, lastName: e.target.value });
          }}
        />
      </div>
      <div className="w-full md:w-full px-3 mb-6 md:mb-0">
        <label
          className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
          htmlFor="grid-email"
        >
          Email
        </label>
        <Input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3"
          id="grid-email"
          type="text"
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
          }}
        />
      </div>
      <div className="w-full md:w-full px-3 mb-6 md:mb-0">
        <label
          className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
          htmlFor="grid-password"
        >
          Password
        </label>
        <Input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-5 leading-tight focus:outline-none focus:bg-white"
          id="grid-password"
          type="password"
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
          }}
        />
      </div>
      <div className="w-full md:w-full px-3 mb-6 md:mb-0 justify-center ">
        <Button
          className="bg-sky-200 rounded py-3 px-4 "
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
            } else {
              alert("Please enter valid first and last name");
            }
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
