import { signOut } from "firebase/auth";
import { useState } from "react";
import { useUserQuery } from "../generated/graphql";
import { useAuth } from "../hooks/useAuth";
import { useSignIn } from "../hooks/useSignIn";
import { auth } from "../lib/firebase";

const logout = () => {
  signOut(auth);
};

export default function Login() {
  const { signInWithGoogle } = useSignIn();

  const { user, loading, error } = useAuth();
  const [{ data }, executeQuery] = useUserQuery({
    variables: { id: user?.uid ?? "" },
  });
  const userId = data?.users_by_pk?.id;

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
        <p>User ID: {userId}</p>
        <button
          onClick={() => {
            executeQuery({ requestPolicy: "network-only" });
          }}
        >
          lol
        </button>
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
