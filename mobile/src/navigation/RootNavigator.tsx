import React, { useCallback, useEffect, useMemo } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@shopify/restyle";
import { useAtom } from "jotai";
import { TouchableOpacity } from "react-native";

import { Box } from "../components/atomic/Box";
import { useAllChatRoomsSubscription } from "../generated/graphql";
import { BxMenu } from "../generated/icons/regular";
import { useLastActiveTracker } from "../hooks/analytics/useLastActiveTracker";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useExpoUpdate } from "../hooks/useExpoUpdate";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser } from "../lib/firebase";
import {
  forceRootNavRerenderAtom,
  notificationsCountAtom,
  showNavDrawerAtom,
} from "../lib/jotai";
import { AccountSettingsScreen } from "../screens/AccountSettingsScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoadingScreen } from "../screens/LoadingScreen";
import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";
import { Theme } from "../theme";

import { SpaceNavigator } from "./SpaceNavigator";
import { RootStackParamList } from "./types";

function useNumberOfNotifications() {
  const { currentProfile } = useCurrentProfile();
  const [{ data, fetching, error }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
    pause: !currentProfile,
  });

  const numUnreadMessages = useMemo(
    () =>
      data?.chat_room.reduce((acc, room) => {
        const myProfileEntry = room.profile_to_chat_rooms.find(
          (entry) => entry.profile.id === currentProfile?.id
        );
        if (!myProfileEntry) return acc;
        const latestMessage = room.latest_chat_message[0];
        if (!latestMessage) return acc;

        const shouldNotHighlight =
          // Latest message was sent by me
          latestMessage.sender_profile_id === myProfileEntry.profile.id ||
          // Latest message sent by the other guy was read
          (myProfileEntry.latest_read_chat_message_id &&
            latestMessage.id <= myProfileEntry.latest_read_chat_message_id);

        if (shouldNotHighlight) {
          return acc;
        } else {
          return acc + 1;
        }
      }, 0),
    [data, currentProfile?.id]
  );

  const [_, setNotificationsCount] = useAtom(notificationsCountAtom);
  useEffect(() => {
    setNotificationsCount(numUnreadMessages ?? 0);
  }, [numUnreadMessages, setNotificationsCount]);
}

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { refreshSession } = useRefreshSession();
  const [rerenderHack] = useAtom(forceRootNavRerenderAtom);

  useLastActiveTracker();
  useNumberOfNotifications();

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
                <RootStack.Screen
                  name="AccountSettings"
                  component={AccountSettingsScreen}
                  options={{ title: "Account Settings" }}
                />
              </>
            )}
          </>
        )}
      </RootStack.Navigator>
    </>
  );
}
