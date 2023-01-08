import React, { useCallback, useEffect, useState } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@shopify/restyle";
import { useAtom } from "jotai";
import { TouchableOpacity } from "react-native";

import { Box } from "../components/atomic/Box";
import { useSpaceBySlugQuery } from "../generated/graphql";
import { BxMenu } from "../generated/icons/regular";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { usePrevious } from "../hooks/usePrevious";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser } from "../lib/firebase";
import { currentSpaceAtom, sessionAtom, showNavDrawerAtom } from "../lib/jotai";
import { SecureStore, SecureStoreKey } from "../lib/secureStore";
import { ChatRoomScreen } from "../screens/ChatRoomScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfilePageScreen } from "../screens/ProfilePageScreen";
import { SignInScreen } from "../screens/SignInScreen";
import { Theme } from "../theme";

import { SpaceNavigator } from "./SpaceNavigator";
import { RootStackParamList } from "./types";

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
        const lastVisitedSpaceId = SecureStore.get(
          SecureStoreKey.LastVisitedSpaceId
        );
        refreshSession({
          forceUpdateJwt: true,
          spaceId:
            typeof lastVisitedSpaceId === "string"
              ? lastVisitedSpaceId
              : undefined,
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

  const theme = useTheme<Theme>();

  const [showDrawer, setShowDrawer] = useAtom(showNavDrawerAtom);
  return (
    <>
      <RootStack.Navigator
        screenOptions={{
          headerBackground: () => (
            <Box
              backgroundColor="olive100"
              height="100%"
              width="100%"
              shadowColor="black"
              borderBottomColor="olive200"
              borderBottomWidth={1}
            />
          ),
          headerTintColor: theme.colors.green800,
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowDrawer(true);
                }}
              >
                <BxMenu
                  height={28}
                  width={28}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  color="black"
                />
              </TouchableOpacity>
            </>
          ),
        }}
      >
        {!isLoggedIn ? (
          <RootStack.Screen
            name="SignIn"
            options={{
              title: "Sign in",
              headerRight: undefined,
            }}
            component={SignInScreen}
          />
        ) : (
          <>
            <RootStack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Canopy Home" }}
            />
            <RootStack.Screen
              name="SpaceHome"
              component={SpaceNavigator}
              options={({ route }) => ({
                title: spaceRaw?.name,
                headerBackVisible: false,
              })}
            />

            <RootStack.Screen
              name="ProfilePage"
              component={ProfilePageScreen}
              options={({ route }) => ({
                // title: `${route.params.firstName} ${route.params.lastName}`,
                title: "",
                headerBackTitle: "Back",
                animationTypeForReplace: "push",
              })}
            />
            <RootStack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={({ route }) => ({
                // title: route.params.chatRoomName,
                title: "",
                headerBackTitle: "Back",
                headerBackground: () => (
                  <Box
                    backgroundColor="olive100"
                    height="100%"
                    width="100%"
                    shadowColor="black"
                    flexDirection="row"
                  ></Box>
                ),
              })}
            />
          </>
        )}
      </RootStack.Navigator>
    </>
  );
}
