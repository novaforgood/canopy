import { useEffect } from "react";

import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView, Platform } from "react-native";

import { RenderChatRoom } from "../components/chat/RenderChatRoom";

import type { SpaceStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

// HACK: shim all `expo-notification` calls as it breaks development for iOS.
// https://github.com/expo/expo/issues/15788
const IOS_NOTIFICATION_ISSUE = Platform.OS === "ios" && __DEV__;

export function ChatRoomScreen({
  navigation,
  route,
}: StackScreenProps<SpaceStackParamList, "ChatRoom">) {
  const chatRoomId = route.params.chatRoomId;

  useEffect(() => {
    const disableNotificationsForThisChatRoom = async () => {
      if (!IOS_NOTIFICATION_ISSUE) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Notifications = await import("expo-notifications");
        Notifications.setNotificationHandler({
          handleNotification: async (notification) => ({
            shouldShowAlert:
              notification.request.content.data?.chatRoomId !== chatRoomId,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
      }
    };
    disableNotificationsForThisChatRoom();

    return () => {
      const reenableNotifs = async () => {
        if (!IOS_NOTIFICATION_ISSUE) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Notifications = await import("expo-notifications");
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
          });
        }
      };
      reenableNotifs();
    };
  }, [chatRoomId]);

  return (
    <SafeAreaView>
      <RenderChatRoom chatRoomId={route.params.chatRoomId} />
    </SafeAreaView>
  );
}
