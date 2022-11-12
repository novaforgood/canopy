import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import Messages from "../screens/directory/Messages";
import Profiles from "../screens/directory/Profiles";
import Account from "../screens/directory/Account";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { Text } from "../components/atomic/Text";
import { BxGroup, BxMessage, BxUser } from "../generated/icons/regular";
import { SvgProps } from "react-native-svg";
import { Box } from "../components/atomic/Box";

const TabNav = createBottomTabNavigator();

const BOTTOM_TABS: Record<
  string,
  { icon: (props: SvgProps & { color: string }) => JSX.Element }
> = {
  "View Profiles": { icon: BxGroup },
  "My Chats": { icon: BxMessage },
  Account: { icon: BxUser },
};

function DirectoryNavigator() {
  return (
    <TabNav.Navigator tabBar={MyTabBar} screenOptions={{ headerShown: false }}>
      <TabNav.Screen name="View Profiles" component={Profiles} />
      <TabNav.Screen name="My Chats" component={Messages} />
      <TabNav.Screen name="Account" component={Account} />
    </TabNav.Navigator>
  );
}

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView style={{ flexDirection: "row" }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true, params: {} });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const Icon = BOTTOM_TABS[label].icon;
        return (
          <TouchableOpacity
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
                {label}
              </Text>
            </Box>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}

export default DirectoryNavigator;
