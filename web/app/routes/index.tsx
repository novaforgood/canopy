import { useAuthenticationStatus, useSignOut, useUserData } from "@nhost/react";

export default function Index() {
  const { signOut } = useSignOut();
  const user = useUserData();

  const { isLoading, isAuthenticated } = useAuthenticationStatus();

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <div>
          <h1>Hello, {user?.displayName}</h1>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div>
          <h1 className="bg-red-50">Not Authenticated</h1>

          <a href="/login">Login</a>
        </div>
      )}
    </div>
  );
}
