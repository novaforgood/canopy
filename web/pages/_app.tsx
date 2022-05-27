import { Suspense, useEffect, useMemo } from "react";

import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { Provider } from "urql";

import { useSpaceBySlugQuery } from "../generated/graphql";
import { loadSession } from "../lib";
import { auth } from "../lib/firebase";
import { sessionAtom } from "../lib/recoil";
import { getUrqlClient } from "../lib/urql";

import type { AppProps } from "next/app";

import "../styles/globals.css";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { usePrevious } from "../hooks/usePrevious";
import AuthWrapper from "../components/AuthWrapper";
import {CustomPage} from "../types";

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
  const [session, setSession] = useRecoilState(sessionAtom);
  const router = useRouter();
  const spaceSlug = router.query.slug as string;
  const [{ data: spaceData }, executeQuery] = useSpaceBySlugQuery({
    pause: true,
    variables: { slug: spaceSlug },
  });
  const spaceId = spaceData?.space[0].id;

  // When a new spaceId is set, we need to refetch the invite links.
  useEffect(() => {
    const reloadSession = async () => {
      const session = await loadSession({
        spaceId: spaceId,
        forceUpdateJwt: true,
      });
      setSession(session);
    };

    if (spaceId) {
      console.log("Refreshing JWT...");
      reloadSession();
    }
  }, [spaceId, setSession]);

  // Update space data when slug changes to a non-empty string.
  useEffect(() => {
    if (spaceSlug) {
      console.log("Re-executing space lazy query...");
      executeQuery();
    }
  }, [spaceSlug, executeQuery]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Toaster />
      <Component {...pageProps} />
    </Suspense>
  );
}

type CustomAppProps = AppProps & {
  Component: CustomPage;
};

function AppWrapper({ Component, ...pageProps }: CustomAppProps) {
  return (
    <RecoilRoot>
      <AuthProvider>
        <UrqlProvider>
          <AuthWrapper
            requiresAuthentication={Component.requiresAuthentication}
          >
            <App {...pageProps} Component={Component} />
          </AuthWrapper>
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default AppWrapper;
