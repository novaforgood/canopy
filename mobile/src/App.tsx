import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";
import { Rubik_400Regular } from "@expo-google-fonts/dev";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "./navigation/RootNavigator";
import theme from "./theme";

export default function App() {
  let [fontsLoaded] = useFonts({
    Rubik_400Regular,
  });
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
