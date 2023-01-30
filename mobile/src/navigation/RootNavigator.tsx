import React, { useCallback, useEffect, useState } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@shopify/restyle";
import { useAtom } from "jotai";
import { TouchableOpacity } from "react-native";

import { Box } from "../components/atomic/Box";
import { useSpaceBySlugQuery } from "../generated/graphql";
import { BxMenu } from "../generated/icons/regular";
import { useExpoUpdate } from "../hooks/useExpoUpdate";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { usePrevious } from "../hooks/usePrevious";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser } from "../lib/firebase";
import { sessionAtom, showNavDrawerAtom } from "../lib/jotai";
import { SecureStore, SecureStoreKey } from "../lib/secureStore";
import { ChatRoomScreen } from "../screens/ChatRoomScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoadingScreen } from "../screens/LoadingScreen";
import { ProfilePageScreen } from "../screens/ProfilePageScreen";
import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";
import { Theme } from "../theme";

import { SpaceBottomTabNavigator } from "./SpaceBottomTabNavigator";
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
        refreshSession({
          forceUpdateJwt: true,
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

  const isLoggedIn = useIsLoggedIn();

  const theme = useTheme<Theme>();

  const currentUser = getCurrentUser();
  const emailVerified = currentUser?.emailVerified ?? false;

  const [showDrawer, setShowDrawer] = useAtom(showNavDrawerAtom);

  const { updateChecked } = useExpoUpdate();

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
          contentStyle: {
            // backgroundColor: theme.colors.olive100,
          },
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
        {!updateChecked ? (
          <RootStack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{ headerShown: false, animation: "fade" }}
          />
        ) : !isLoggedIn ? (
          <>
            <RootStack.Screen
              name="SignIn"
              options={{
                title: "Sign in",
                headerRight: undefined,
              }}
              component={SignInScreen}
            />
            <RootStack.Screen
              name="SignUp"
              options={{
                title: "Sign up",
                headerRight: undefined,
              }}
              component={SignUpScreen}
            />
          </>
        ) : (
          <>
            {!emailVerified ? (
              <RootStack.Screen
                name="VerifyEmail"
                options={{
                  title: "Verify Email",
                }}
                component={VerifyEmailScreen}
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
                    header: () => null,
                  })}
                />
              </>
            )}
          </>
        )}
      </RootStack.Navigator>
    </>
  );
}
