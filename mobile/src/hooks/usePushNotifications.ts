import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
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
  if (IOS_NOTIFICATION_ISSUE) {
    toast.success(
      "Notifications disabled on iOS in dev to prevent fast-reload crash"
    );
    return;
  }

  let token;

  toast.success("Device.isDevice: " + Device.isDevice + "");
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    toast.success("finalStatus: " + finalStatus + "");
    toast.success("existingStatus: " + existingStatus + "");
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

  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const init = async () => {
      const alreadyShown = await SecureStore.get(
        SecureStoreKey.ShowedPushNotificationPermissionPrompt
      );
      setShowPrompt(typeof alreadyShown === "boolean" ? !alreadyShown : true);
    };
    init();
  }, []);

  const declineRegisterPushNotifications = useCallback(
    async (neverShowAgain?: boolean) => {
      if (neverShowAgain) {
        await SecureStore.set(
          SecureStoreKey.ShowedPushNotificationPermissionPrompt,
          true
        );
      }
      setShowPrompt(false);
    },
    []
  );

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
    } catch (e: any) {
      toast.error(
        "Error registering for push notifications" + e.message || e.toString()
      );
      handleError(e);
    }
  }, [updateUser, userData?.id]);

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
