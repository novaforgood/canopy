import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import { Box } from "../components/atomic/Box";
import { Text } from "../components/atomic/Text";

const RootStack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View>
      <Box backgroundColor="olive100" height="100%">
        <Text variant="subheading1" padding={4}>
          Welcome to Canopy Mobile
        </Text>
      </Box>
    </View>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Home" component={HomeScreen} />
    </RootStack.Navigator>
  );
}
