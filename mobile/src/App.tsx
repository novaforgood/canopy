import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";
import {
  Rubik_400Regular,
  Rubik_700Bold,
  Rubik_500Medium,
  Rubik_400Regular_Italic,
  Rubik_700Bold_Italic,
  Rubik_500Medium_Italic,
} from "@expo-google-fonts/rubik";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RootNavigator } from "./navigation/RootNavigator";
import theme from "./theme";
import { AuthProvider } from "./providers/AuthProvider";
import { UrqlProvider } from "./providers/UrqlProvider";

function App() {
  let [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
    Rubik_500Medium,
    Rubik_400Regular_Italic,
    Rubik_700Bold_Italic,
    Rubik_500Medium_Italic,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  return (
    <AuthProvider>
      <UrqlProvider>
        <ThemeProvider theme={theme}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </UrqlProvider>
    </AuthProvider>
  );
}

export default App;
