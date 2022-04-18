import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "../components/atomic/Button";
import { useUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useSignIn } from "../hooks/useSignIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

const logout = () => {
  signOut(auth);
};

export default function Login() {
  const { signInWithGoogle } = useSignIn();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const { userData } = useUserData();

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Current User: {userData?.email}</p>
          <p>User ID: {userData?.id}</p>
          <Button
            onClick={() => {
              router.push("/create");
            }}
          >
            Create Program
          </Button>

          <Button onClick={logout}>Log out</Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            signInWithGoogle();
          }}
        >
          Sign in with Google
        </Button>
      )}
    </div>
  );
}
