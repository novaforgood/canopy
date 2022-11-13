import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React, { useCallback, useEffect } from "react";
import { HomeScreen } from "../screens/HomeScreen";

import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser } from "../lib/firebase";

import { useSpaceBySlugQuery } from "../generated/graphql";
import { usePrevious } from "../hooks/usePrevious";
import { SecureStore, SecureStoreKey } from "../lib/secureStore";
import { RootStackParamList } from "../types/navigation";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { SignInScreen } from "../screens/SignInScreen";
import { useAtom } from "jotai";
import { currentSpaceAtom, sessionAtom } from "../lib/jotai";
import DirectoryNavigator from "./DirectoryNavigator";
import { ProfilePageScreen } from "../screens/ProfilePageScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
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
  const [session, setSession] = useAtom(sessionAtom);
  const [spaceRaw, _] = useAtom(currentSpaceAtom);
  const spaceSlug = spaceRaw?.slug;

  const [{ data: spaceData }, executeQuery] = useSpaceBySlugQuery({
    pause: true,
    variables: { slug: spaceSlug ?? "" },
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

  const isLoggedIn = useIsLoggedIn();

  return (
    <RootStack.Navigator>
      {!isLoggedIn && (
        <RootStack.Screen
          name="SignIn"
          options={{
            title: "Sign in",
          }}
          component={SignInScreen}
        />
      )}
      <RootStack.Screen name="Home" component={HomeScreen} />
      <RootStack.Screen
        name="Directory"
        component={DirectoryNavigator}
        options={({ route }) => ({ title: spaceRaw?.name })}
      />
      <RootStack.Screen
        name="ProfilePage"
        component={ProfilePageScreen}
        options={({ route }) => ({ title: route.params.firstName })}
      />
    </RootStack.Navigator>
  );
}
