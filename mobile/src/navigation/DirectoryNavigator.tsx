import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Messages from "../screens/directory/Messages";
import Profiles from "../screens/directory/Profiles";
import Account from "../screens/directory/Account";

const TabNav = createBottomTabNavigator();

function DirectoryNavigator() {
  return (
    <TabNav.Navigator screenOptions={{ headerShown: false }}>
      <TabNav.Screen name="Profiles" component={Profiles} />
      <TabNav.Screen name="Messages" component={Messages} />
      <TabNav.Screen name="Account" component={Account} />
    </TabNav.Navigator>
  );
}

export default DirectoryNavigator;
