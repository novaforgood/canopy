import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React from "react";
import DirectoryScreen from "../screens/Directory";
import HomeScreen from "../screens/Home";

const RootStack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Home" component={HomeScreen} />
      <RootStack.Screen
        name="Directory"
        component={DirectoryScreen}
        options={({ route }) => ({ title: route.params.spaceName })}
      />
    </RootStack.Navigator>
  );
}
