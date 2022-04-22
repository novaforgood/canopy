import type { AppProps } from "next/app";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getUrqlClient } from "../lib/urql";
import { Provider } from "urql";
import { auth } from "../lib/firebase";
import "../styles/globals.css";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { sessionAtom } from "../lib/recoil";

interface UrqlProviderProps {
  children: React.ReactNode;
}
function UrqlProvider({ children }: UrqlProviderProps) {
  const session = useRecoilValue(sessionAtom);

  const client = useMemo(
    () => getUrqlClient(session?.jwt ?? ""),
    [session?.jwt]
  );

  return <Provider value={client}>{children}</Provider>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}
function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useRecoilState(sessionAtom);

  useEffect(() => {
    const unsubscribeListener = auth.onAuthStateChanged(async (user) => {
      // Whenever auth state changes, we no longer know what the session is.
      // We must wait for this handler to run to completion, resolving
      // the session to either authenticated or null.

      setSession(undefined);
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const claims = tokenResult.claims["https://hasura.io/jwt/claims"];

        if (!claims) {
          // New user has logged in but doesn't have JWT claims
          await fetch(`/api/auth/updateJwt`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
            },
          });
          await user.getIdToken(true);
        }

        setSession({
          userId: user.uid,
          jwt: await user.getIdToken(),
        });
      } else {
        setSession(null);
      }
    });

    return () => {
      unsubscribeListener();
    };
  }, [setSession]);

  if (session === undefined) {
    return <div></div>; // TODO: Add loading screen.
  }
  return <>{children}</>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <AuthProvider>
        <UrqlProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Component {...pageProps} />
          </Suspense>
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default MyApp;
