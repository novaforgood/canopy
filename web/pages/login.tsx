import { signOut } from "firebase/auth";
import { useAuth } from "../src/hooks/useAuth";
import { useSignIn } from "../src/hooks/useSignIn";
import { auth } from "../src/lib/firebase";

const logout = () => {
  signOut(auth);
};

export default function Login() {
  const { signInWithGoogle } = useSignIn();

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
          signInWithGoogle().then(() => {});
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
