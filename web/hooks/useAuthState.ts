import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const listener = onAuthStateChanged(auth, async (user) => {
      setUser(user);
    });

    return () => {
      listener();
    };
  }, []);

  return { user };
}
