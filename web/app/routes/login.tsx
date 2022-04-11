import { useState } from "react";
import { Button } from "~/components/atomic/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div>
      <div>Login with email</div>
      <input
        type="text"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Button onClick={() => {}}>Login</Button>

      {emailSent && (
        <div>
          Email sent to {email}. Click the link in the e-mail to log in.
        </div>
      )}
    </div>
  );
}
