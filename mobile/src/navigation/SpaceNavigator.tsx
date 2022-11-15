import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { MessagesScreen } from "../screens/directory/MessagesScreen";
import { ProfilesList } from "../screens/directory/profiles/ProfilesList";
import { AccountScreen } from "../screens/directory/AccountScreen";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { Text } from "../components/atomic/Text";
import {
  BxGroup,
  BxMessageAltDetail,
  BxUser,
} from "../generated/icons/regular";
import { SvgProps } from "react-native-svg";
import { Box } from "../components/atomic/Box";
import { Navbar } from "../components/Navbar";
import { RootStackParamList, SpaceStackParamList } from "./types";
import { StackScreenProps } from "@react-navigation/stack";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { currentSpaceAtom } from "../lib/jotai";

const TabNav = createBottomTabNavigator<SpaceStackParamList>();

const BOTTOM_TABS: Record<
  keyof SpaceStackParamList,
  { icon: (props: SvgProps & { color: string }) => JSX.Element; title: string }
> = {
  ProfilesList: { icon: BxGroup, title: "View Profiles" },
  ChatMessages: { icon: BxMessageAltDetail, title: "Messages" },
  Account: { icon: BxUser, title: "Account" },
};

export function SpaceNavigator({
  route,
}: StackScreenProps<RootStackParamList, "SpaceHome">) {
  const [_, setCurrentSpace] = useAtom(currentSpaceAtom);

  useEffect(() => {
    if (route.params) {
      setCurrentSpace({
        slug: route.params.spaceSlug,
        name: route.params.spaceName,
      });
    }
  }, [route.params]);

  return (
    <TabNav.Navigator tabBar={MyTabBar} screenOptions={{ headerShown: false }}>
      <TabNav.Screen name="ProfilesList" component={ProfilesList} />
      <TabNav.Screen name="ChatMessages" component={MessagesScreen} />
      <TabNav.Screen name="Account" component={AccountScreen} />
    </TabNav.Navigator>
  );
}

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <Box borderTopColor="green700" borderTopWidth={1}>
      <SafeAreaView style={{ flexDirection: "row" }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name as keyof SpaceStackParamList;
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
              <Box flexDirection="column" alignItems="center" pt={2}>
                <Icon
                  color={isFocused ? "black" : "gray500"}
                  height={24}
                  width={24}
                />
                <Text color={isFocused ? "black" : "gray500"} mt={1}>
                  {title}
                </Text>
              </Box>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    </Box>
  );
}
