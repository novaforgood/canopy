import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useState } from "react";

// Plan
// Create user with email and password (getAuth().createUser or createUserWithEmailAndPassword?)
// update profile/update user
// upsert data to our db ()
// send authentication link to email
// complete sign in with auth link

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console.
  url: "https://www.example.com/finishSignUp?cartId=1234",
  // This must be true.
  handleCodeInApp: true,
};

const signUpUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCred) => {
      const user = userCred.user;
      const tokenResult = await user.getIdTokenResult();
      const name = `${firstName} ${lastName}`;
      updateProfile(user, {
        displayName: name,
      });
      await fetch(`/api/auth/upsertUserData`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenResult.token}`,
        },
      });
    })
    .catch((e) => {
      alert(e.code + ": " + e.message);
    });
};

const sendAuthLink = async () => {};

export default function signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  return (
    <div className="w-full  max-w-lg rounded p-4 flex flex-wrap -mx-3">
      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
        <label
          className="block uppercase tracking-wide text-slate-800 text-sm font-bold mb-2"
          htmlFor="grid-first-name"
        >
          First Name
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="grid-first-name"
          pattern="[A-Za-z]{2,}"
          type="text"
          placeholder="Enter your first name"
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
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="grid-last-name"
          pattern="[A-Za-z]{2,}"
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
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
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
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-5 leading-tight focus:outline-none focus:bg-white"
          id="grid-password"
          type="text"
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
          }}
        />
      </div>
      <div className="w-full md:w-full px-3 mb-6 md:mb-0 justify-center ">
        <button
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
        </button>
      </div>
    </div>
    // <div className='flex flex-wrap max-w-xl'>
    // <div className="w-1/2 bg-sky-200">
    //     test
    // </div>
    // </div>
  );
}
