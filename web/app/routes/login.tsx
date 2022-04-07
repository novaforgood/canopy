import { useProviderLink, useSignInEmailPasswordless } from "@nhost/react";
import { useState } from "react";

export default function Login() {
  const { google } = useProviderLink();
  const { signInEmailPasswordless, isLoading, isSuccess, isError, error } =
    useSignInEmailPasswordless();

  const [email, setEmail] = useState("");

  if (isSuccess) {
    return (
      <div>
        <div>
          An email has been sent to {email}. Please check your mailbox and click
          on the authentication link.
        </div>
      </div>
    );
  }

  return (
    <div>
      <a href={`${google}`}>Login with google</a>

      <div>Login with email</div>
      <input
        type="text"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <button
        onClick={() => {
          console.log(email);
          signInEmailPasswordless(email);
        }}
      >
        Login
      </button>
    </div>
  );
}
