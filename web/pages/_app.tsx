import { Suspense, useCallback, useEffect, useMemo } from "react";

import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { Provider } from "urql";

import AuthWrapper from "../components/AuthWrapper";
import { Footer } from "../components/Footer";
import { useSpaceBySlugQuery } from "../generated/graphql";
import { usePrevious } from "../hooks/usePrevious";
import { loadSession, LoadSessionProps } from "../lib";
import { handleError } from "../lib/error";
import { getCurrentUser, onAuthStateChanged } from "../lib/firebase";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import { sessionAtom } from "../lib/recoil";
import { getUrqlClient } from "../lib/urql";
import { CustomPage } from "../types";

import type { AppProps } from "next/app";

import "../styles/globals.css";

function useRefreshSession() {
  const [session, setSession] = useRecoilState(sessionAtom);

  const refreshSession = useCallback(
    async (props: (LoadSessionProps & { hardRefresh?: boolean }) | void) => {
      const session = await loadSession(props);
      setSession(session);
    },
    [setSession]
  );

  return useMemo(() => ({ refreshSession }), [refreshSession]);
}
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

  if (session === undefined) return null;

  return <>{children}</>;
}

type CustomAppProps = AppProps & {
  Component: CustomPage;
};

function App({ Component, pageProps }: CustomAppProps) {
  const { refreshSession } = useRefreshSession();

  ///// Force update JWT if it will expire in 3 minutes /////
  const refreshSessionIfNeeded = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const token = await currentUser.getIdTokenResult();
      const expiresAt = new Date(token.expirationTime).getTime();
      const expiresIn = expiresAt - Date.now();

      // const expireThreshold = 3590000; // For debugging
      const expireThreshold = 180000;

      if (expiresIn < expireThreshold) {
        console.log("Force updating JWT since it expires in 3 minutes...");
        const lastVisitedSpaceId = LocalStorage.get(
          LocalStorageKey.LastVisitedSpaceId
        )?.toString();
        refreshSession({
          forceUpdateJwt: true,
          spaceId: lastVisitedSpaceId ?? undefined,
        });
      }
    }
  }, [refreshSession]);

  useEffect(() => {
    const interval = setInterval(refreshSessionIfNeeded, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [refreshSessionIfNeeded]);

  ///// Force update JWT if user changed space /////
  const [session, setSession] = useRecoilState(sessionAtom);
  const router = useRouter();
  const spaceSlug = router.query.slug as string;
  const [{ data: spaceData }, executeQuery] = useSpaceBySlugQuery({
    pause: true,
    variables: { slug: spaceSlug },
  });
  const previousSlug = usePrevious(spaceSlug);
  useEffect(() => {
    // Update space data when slug changes to a non-empty string.
    if (spaceSlug && spaceSlug !== previousSlug) {
      console.log("Re-executing space lazy query...");
      executeQuery();
    }
  }, [spaceSlug, executeQuery, previousSlug]);
  const spaceId = spaceData?.space[0]?.id;

  useEffect(() => {
    const lastVisitedSpaceId = LocalStorage.get(
      LocalStorageKey.LastVisitedSpaceId
    );
    if (spaceId === lastVisitedSpaceId) {
      return;
    } else {
      if (spaceId) {
        console.log("Refreshing JWT due to spaceId change...");
        refreshSession({ forceUpdateJwt: true, spaceId: spaceId });
        LocalStorage.set(LocalStorageKey.LastVisitedSpaceId, spaceId);
      }
    }
  }, [spaceId, setSession, refreshSession]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Toaster />
      <Component {...pageProps} />
      {Component.showFooter !== false && <Footer />}
    </Suspense>
  );
}

function AppWrapper({ Component, ...pageProps }: CustomAppProps) {
  return (
    <RecoilRoot>
      <AuthProvider>
        <UrqlProvider>
          <AuthWrapper
            requiredAuthorizations={Component.requiredAuthorizations}
          >
            <App {...pageProps} Component={Component} />
          </AuthWrapper>
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default AppWrapper;
