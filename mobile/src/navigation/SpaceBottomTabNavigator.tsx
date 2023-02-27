import { useEffect, useMemo } from "react";

import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { StackScreenProps } from "@react-navigation/stack";
import { useAtom } from "jotai";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import { Box } from "../components/atomic/Box";
import { Text } from "../components/atomic/Text";
import { Navbar } from "../components/Navbar";
import { useAllChatRoomsSubscription } from "../generated/graphql";
import {
  BxGroup,
  BxHome,
  BxMessageAltDetail,
  BxUser,
} from "../generated/icons/regular";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { notificationsCountAtom } from "../lib/jotai";
import { AccountScreen } from "../screens/directory/AccountScreen";
import { MessagesScreen } from "../screens/directory/MessagesScreen";
import { ProfilesList } from "../screens/directory/profiles/ProfilesList";

import {
  RootStackParamList,
  SpaceBottomTabStackParamList,
  SpaceStackParamList,
} from "./types";

const TabNav = createBottomTabNavigator<SpaceBottomTabStackParamList>();

const BOTTOM_TABS: Record<
  keyof SpaceBottomTabStackParamList,
  { icon: (props: SvgProps & { color: string }) => JSX.Element; title: string }
> = {
  ProfilesList: { icon: BxHome, title: "Home" },
  ChatMessages: { icon: BxMessageAltDetail, title: "Chats" },
  Account: { icon: BxUser, title: "Account" },
};

export function SpaceBottomTabNavigator({
  route,
}: StackScreenProps<SpaceStackParamList, "SpaceBottomTabs">) {
  return (
    <TabNav.Navigator tabBar={MyTabBar} screenOptions={{ headerShown: false }}>
      <TabNav.Screen name="ProfilesList" component={ProfilesList} />
      <TabNav.Screen name="ChatMessages" component={MessagesScreen} />
      <TabNav.Screen name="Account" component={AccountScreen} />
    </TabNav.Navigator>
  );
}

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // const [numNotifs] = useAtom(notificationsCountAtom);
  // const showRedDot = numNotifs > 0;
  return (
    <Box borderTopColor="green700" borderTopWidth={1}>
      <SafeAreaView style={{ flexDirection: "row" }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name as keyof SpaceBottomTabStackParamList;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate({
                name: route.name,
                merge: true,
                params: {},
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const Icon = BOTTOM_TABS[label].icon;
          const title = BOTTOM_TABS[label].title;
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1 }}
            >
              <Box>
                <Box
                  flexDirection="column"
                  alignItems="center"
                  pt={2}
                  position="relative"
                >
                  <Box
                    position="relative"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Icon
                      color={isFocused ? "black" : "gray500"}
                      height={24}
                      width={24}
                    />
                    <Text color={isFocused ? "black" : "gray500"} mt={1}>
                      {title}
                    </Text>
                    {title === "Chats" && <RedDot />}
                  </Box>
                </Box>
              </Box>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    </Box>
  );
}

function RedDot() {
  const [numNotifs] = useAtom(notificationsCountAtom);
  const showRedDot = numNotifs > 0;

  if (!showRedDot) return null;
  return (
    <Box
      position="absolute"
      height={8}
      width={8}
      backgroundColor="systemError"
      borderRadius="full"
      top={-2}
      right={6}
    ></Box>
  );
}
