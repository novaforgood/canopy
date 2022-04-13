import { signOut } from "firebase/auth";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../lib/firebase";

const logout = () => {
  signOut(auth);
};

export default function Login() {
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (user) {
    return (
      <div>
        <p>Current User: {user.email}</p>
        <button onClick={logout}>Log out</button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          signInWithGoogle();
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
