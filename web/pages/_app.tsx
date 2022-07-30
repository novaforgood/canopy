import { Suspense, useCallback, useEffect } from "react";

import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { RecoilRoot, useRecoilState } from "recoil";

import { Footer } from "../components/Footer";
import { useSpaceBySlugQuery } from "../generated/graphql";
import { usePrevious } from "../hooks/usePrevious";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser } from "../lib/firebase";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import { sessionAtom } from "../lib/recoil";
import { AuthProvider } from "../providers/AuthProvider";
import { UrqlProvider } from "../providers/UrqlProvider";
import { CustomPage } from "../types";

import type { AppProps } from "next/app";

import "../styles/globals.css";

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
      <AuthProvider requiredAuthorizations={Component.requiredAuthorizations}>
        <UrqlProvider>
          <App {...pageProps} Component={Component} />
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default AppWrapper;
