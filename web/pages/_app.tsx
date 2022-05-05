import { Suspense, useEffect, useMemo, useState } from "react";

import type { AppProps } from "next/app";
import { getUrqlClient } from "../lib/urql";
import { Provider } from "urql";
import { Toaster } from "react-hot-toast";
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
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { loadSession } from "../lib";

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
      const session = await loadSession();
      setSession(session);
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

function App({ Component, pageProps }: AppProps) {
  const { currentSpace } = useCurrentSpace();
  const [session, setSession] = useRecoilState(sessionAtom);

  useEffect(() => {
    const reloadSession = async () => {
      const session = await loadSession({
        spaceId: currentSpace?.id,
        forceUpdateJwt: true,
      });
      setSession(session);
    };
    reloadSession();
  }, [currentSpace?.id, setSession]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Toaster />
      <Component {...pageProps} />
    </Suspense>
  );
}

function AppWrapper({ Component, ...pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <AuthProvider>
        <UrqlProvider>
          <App {...pageProps} Component={Component} />
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default AppWrapper;
