import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";
import { Rubik_400Regular } from "@expo-google-fonts/dev";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "./navigation/RootNavigator";
import theme from "./theme";
import { RecoilRoot, useRecoilState } from "recoil";
import { AuthProvider } from "./providers/AuthProvider";
import { UrqlProvider } from "./providers/UrqlProvider";
import { useRefreshSession } from "./hooks/useRefreshSession";
import { getCurrentUser } from "./lib/firebase";

import { sessionAtom } from "./lib/recoil";
import { useSpaceBySlugQuery } from "./generated/graphql";
import { usePrevious } from "./hooks/usePrevious";
import { SecureStore, SecureStoreKey } from "./lib/secureStore";

function App() {
  let [fontsLoaded] = useFonts({
    Rubik_400Regular,
  });

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
        const lastVisitedSpaceId = await SecureStore.get(
          SecureStoreKey.LastVisitedSpaceId
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
  // const router = useRouter();
  // const spaceSlug = router.query.slug as string;
  const spaceSlug = "test-space";
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
    const attemptRefreshJwt = async () => {
      const lastVisitedSpaceId = await SecureStore.get(
        SecureStoreKey.LastVisitedSpaceId
      );
      if (spaceId === lastVisitedSpaceId) {
        return;
      } else {
        if (spaceId) {
          console.log("Refreshing JWT due to spaceId change...");
          refreshSession({ forceUpdateJwt: true, spaceId: spaceId });
          SecureStore.set(SecureStoreKey.LastVisitedSpaceId, spaceId);
        }
      }
    };
    attemptRefreshJwt();
  }, [spaceId, setSession, refreshSession]);

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <RecoilRoot>
      <AuthProvider>
        <UrqlProvider>
          <App />
        </UrqlProvider>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default AppWrapper;
