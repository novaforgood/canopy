import { useEffect } from "react";

import { useAtom } from "jotai";
import { useRouter } from "next/router";

import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser, onAuthStateChanged } from "../lib/firebase";
import { sessionAtom } from "../lib/jotai";
import {
  AuthenticationStatus,
  RequiredAuthorization,
} from "../types/requiredAuthorization";

interface AuthProviderProps {
  children: React.ReactNode;
  requiredAuthorizations?: RequiredAuthorization[];
}
export function AuthProvider({
  children,
  requiredAuthorizations = [AuthenticationStatus.LoggedIn],
}: AuthProviderProps) {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [session, setSession] = useAtom(sessionAtom);

  const { refreshSession } = useRefreshSession();

  useEffect(() => {
    const unsubscribeListener = onAuthStateChanged(async () => {
      // Whenever auth state changes, we no longer know what the session is.
      // We must wait for this handler to run to completion, resolving
      // the session to either authenticated or null.
      setSession(undefined);
      refreshSession();
    });

    return () => {
      unsubscribeListener();
    };
  }, [refreshSession, setSession]);

  // Return nothing if session is not yet resolved.
  if (session === undefined) return null;

  // If the user is not logged in, redirect to the login page.
  if (requiredAuthorizations.includes(AuthenticationStatus.LoggedIn)) {
    const currentUser = getCurrentUser();
    if (!isLoggedIn) {
      const prefix = router.asPath.split("?")[0];
      if (prefix !== "/signup") {
        router.replace(`/signup?redirect=${router.asPath}`);
        return null;
      }
    } else if (currentUser && currentUser.emailVerified === false) {
      const prefix = router.asPath.split("?")[0];
      if (prefix !== "/verify") {
        router.replace({
          pathname: "/verify",
          query: { redirect: router.asPath },
        });
        return null;
      }
    }
  }

  return <>{children}</>;
}
