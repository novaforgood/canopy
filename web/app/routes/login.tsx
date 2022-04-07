import { useProviderLink, useSignInEmailPasswordless } from "@nhost/react";
import { useState } from "react";
import { Button } from "~/components/atomic/Button";

export default function Login() {
  const { google } = useProviderLink();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { signInEmailPasswordless } = useSignInEmailPasswordless(email);

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
      <Button
        onClick={() => {
          signInEmailPasswordless().then(() => {
            setEmailSent(true);
          });
        }}
      >
        Login
      </Button>

      {emailSent && (
        <div>
          Email sent to {email}. Click the link in the e-mail to log in.
        </div>
      )}
    </div>
  );
}
