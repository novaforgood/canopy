import { User } from "firebase/auth";
import { useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";

export function useAuth() {
  const handleUserChanged = useCallback(async (user: User | null) => {
    if (!user) return;
    const token = await auth.currentUser?.getIdToken();
    await fetch("/api/updateJwt", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    await auth.currentUser?.getIdToken(true);
  }, []);

  const [user, loading, error] = useAuthState(auth, {
    onUserChanged: handleUserChanged,
  });

  return {
    user,
    loading,
    error,
  };
}
