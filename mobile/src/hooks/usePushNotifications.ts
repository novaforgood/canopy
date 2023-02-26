import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Device from "expo-device";
import { Platform } from "react-native";

import { useUpdateUserMutation } from "../generated/graphql";
import { handleError } from "../lib/error";

import { SecureStore, SecureStoreKey } from "./../lib/secureStore";
import { useUserData } from "./useUserData";

// HACK: shim all `expo-notification` calls as it breaks development for iOS.
// https://github.com/expo/expo/issues/15788
const IOS_NOTIFICATION_ISSUE = Platform.OS === "ios" && __DEV__;

export const setNotificationHandler = (...args: any[]) => null;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifications = IOS_NOTIFICATION_ISSUE
  ? null
  : require("expo-notifications");

if (!IOS_NOTIFICATION_ISSUE) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function getDevicePushTokenAsync() {
  if (IOS_NOTIFICATION_ISSUE)
    throw new Error(
      "Notifications disabled on iOS in dev to prevent fast-reload crash"
    );
  return Notifications.getDevicePushTokenAsync();
}

async function registerForPushNotificationsAsync() {
  if (IOS_NOTIFICATION_ISSUE) return;

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      // alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("expo push token", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token;
}

export function usePushNotifications() {
  const { userData } = useUserData();

  const [_, updateUser] = useUpdateUserMutation();

  const [showedPrompt, setShowedPrompt] = useState(false);

  useEffect(() => {
    const init = async () => {
      const showed = await SecureStore.get(
        SecureStoreKey.ShowedPushNotificationPermissionPrompt
      );
      setShowedPrompt(typeof showed === "boolean" ? showed : false);
    };
    init();
  }, []);

  const declineRegisterPushNotifications = useCallback(async () => {
    await SecureStore.set(
      SecureStoreKey.ShowedPushNotificationPermissionPrompt,
      true
    );
    setShowedPrompt(true);
  }, []);

  const attemptRegisterPushNotifications = useCallback(async () => {
    if (!userData?.id) return;

    try {
      const token = await registerForPushNotificationsAsync();

      // At this point, we've shown the prompt, so we don't need to show it again.
      // await SecureStore.set(
      //   SecureStoreKey.ShowedPushNotificationPermissionPrompt,
      //   true
      // );
      // setShowedPrompt(true);

      if (!token) return;
      updateUser({
        id: userData?.id,
        changes: {
          expo_push_token: token,
        },
      });
    } catch (e) {
      handleError(e);
    }
  }, [updateUser, userData?.id]);

  return useMemo(() => {
    return {
      attemptRegisterPushNotifications,
      declineRegisterPushNotifications,
      shouldShowPushNotificationPermissionPrompt:
        !userData?.expo_push_token && !showedPrompt,
    };
  }, [
    attemptRegisterPushNotifications,
    declineRegisterPushNotifications,
    showedPrompt,
    userData?.expo_push_token,
  ]);
}
