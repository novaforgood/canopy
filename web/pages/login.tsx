import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
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
  const { userData } = useUserData();

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Current User: {userData?.email}</p>
          <p>User ID: {userData?.id}</p>

          <button onClick={logout}>Log out</button>
        </div>
      ) : (
        <button
          onClick={() => {
            signInWithGoogle();
          }}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
