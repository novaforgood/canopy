import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as Device from "expo-device";
import { PermissionStatus } from "expo-modules-core";
import { Platform } from "react-native";

import { toast } from "../components/CustomToast";
import { useUpdateUserMutation } from "../generated/graphql";
import { handleError } from "../lib/error";

import { SecureStore, SecureStoreKey } from "./../lib/secureStore";
import { useUserData } from "./useUserData";

// HACK: shim all `expo-notification` calls as it breaks development for iOS.
// https://github.com/expo/expo/issues/15788
const IOS_NOTIFICATION_ISSUE = Platform.OS === "ios" && __DEV__;

if (!IOS_NOTIFICATION_ISSUE) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Notifications = require("expo-notifications");
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
  const Notifications = await import("expo-notifications");
  return Notifications.getDevicePushTokenAsync();
}

/**
 *
 * If the user has not yet registered for push notifications, this will register them.
 * @returns the token if the user was registered, or null if they were already registered.
 */
async function registerForPushNotificationsAsync() {
  if (IOS_NOTIFICATION_ISSUE) {
    toast.error(
      "Notifications disabled on iOS in dev to prevent fast-reload crash"
    );
    return null;
  }

  let token;

  const Notifications = await import("expo-notifications");

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== PermissionStatus.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== PermissionStatus.GRANTED) {
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    return null;
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
  const { userData, fetchingUserData } = useUserData();

  const [_, updateUser] = useUpdateUserMutation();

  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // If the user has already registered for push notifications, but we don't have their token,
    // then update our database with their token.

    // If fetching user data, or if we already have a token, then don't do anything.
    if (fetchingUserData) return;
    if (userData?.expo_push_token) return;

    const attemptPostMissingToken = async () => {
      // If the user hasn't registered for push notifications, then don't do anything.

      if (IOS_NOTIFICATION_ISSUE) return;
      const Notifications = await import("expo-notifications");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      if (existingStatus !== PermissionStatus.GRANTED) return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (!token) return;
      if (!userData?.id) return;

      try {
        await updateUser({
          id: userData.id,
          changes: {
            expo_push_token: token,
          },
        });
      } catch (error) {
        handleError(error);
      }
    };
    attemptPostMissingToken();
  }, [userData, fetchingUserData, updateUser]);

  const calculateIfShouldShowPrompt = useCallback(async () => {
    if (IOS_NOTIFICATION_ISSUE) return;
    const Notifications = await import("expo-notifications");

    // Calculate if we have shown the modal before.
    const modalAlreadyShownRaw = await SecureStore.get(
      SecureStoreKey.ShowedPushNotificationPermissionPrompt
    );
    const modalAlreadyShown =
      typeof modalAlreadyShownRaw === "boolean" ? modalAlreadyShownRaw : false;

    // Calculate if we have shown the native notification prompt before. (e.g. the user clicked "allow" on the modal)
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    const promptHasBeenShown = existingStatus !== PermissionStatus.UNDETERMINED;

    const shouldShowPrompt = !modalAlreadyShown && !promptHasBeenShown;

    setShowPrompt(shouldShowPrompt);
  }, []);

  useEffect(() => {
    // Wait a second before calculating if we should show the prompt.

    setTimeout(() => {
      calculateIfShouldShowPrompt();
    }, 1000);
  }, [calculateIfShouldShowPrompt]);

  const declineRegisterPushNotifications = useCallback(
    async (neverShowAgain?: boolean) => {
      if (neverShowAgain) {
        await SecureStore.set(
          SecureStoreKey.ShowedPushNotificationPermissionPrompt,
          true
        );
        calculateIfShouldShowPrompt();
      } else {
        setShowPrompt(false);
      }
    },
    [calculateIfShouldShowPrompt]
  );

  const attemptRegisterPushNotifications = useCallback(async () => {
    if (!userData?.id) return;

    try {
      const token = await registerForPushNotificationsAsync();

      calculateIfShouldShowPrompt();

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
  }, [calculateIfShouldShowPrompt, updateUser, userData?.id]);

  return useMemo(() => {
    return {
      attemptRegisterPushNotifications,
      declineRegisterPushNotifications,
      shouldShowPushNotificationPermissionPrompt:
        !userData?.expo_push_token && showPrompt,
    };
  }, [
    attemptRegisterPushNotifications,
    declineRegisterPushNotifications,
    showPrompt,
    userData?.expo_push_token,
  ]);
}
