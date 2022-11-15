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
import React, { useCallback, useEffect, useRef } from "react";
import {
  GestureResponderEvent,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { RootNavigator } from "./navigation/RootNavigator";
import theme from "./theme";
import { AuthProvider } from "./providers/AuthProvider";
import { UrqlProvider } from "./providers/UrqlProvider";
import { useAtom } from "jotai";
import { showNavDrawerAtom } from "./lib/jotai";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { Box } from "./components/atomic/Box";
import { Text } from "./components/atomic/Text";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { BxX } from "./generated/icons/regular";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./components/atomic/Button";
import { signOut } from "./lib/firebase";
import { CustomToast } from "./components/CustomToast";

function App() {
  let [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
    Rubik_500Medium,
    Rubik_400Regular_Italic,
    Rubik_700Bold_Italic,
    Rubik_500Medium_Italic,
  });

  const [showNavDrawer, setShowNavDrawer] = useAtom(showNavDrawerAtom);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UrqlProvider>
          <ThemeProvider theme={theme}>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" />
              <RootNavigator />
              {showNavDrawer && <NavDrawer />}
            </NavigationContainer>
            <CustomToast />
          </ThemeProvider>
        </UrqlProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

/**
 * use recursive to check if press inside that component
 * @param target - this is childRef component
 * @param nestedViewRef - all of children element of childRef
 */
const isTapInsideComponent = (target: any, nestedViewRef: any): boolean => {
  if (
    target &&
    nestedViewRef &&
    target._nativeTag === nestedViewRef._nativeTag
  ) {
    return true;
  }

  if (nestedViewRef._children && nestedViewRef._children.length > 0) {
    for (let index = 0; index <= nestedViewRef._children.length - 1; index++) {
      if (isTapInsideComponent(target, nestedViewRef._children[index])) {
        return true;
      }
    }
  }

  return false;
};

function NavDrawer() {
  const [showDrawer, setShowDrawer] = useAtom(showNavDrawerAtom);

  const drawerRef = useRef(null);
  return (
    <Animated.View
      entering={SlideInRight}
      exiting={SlideOutRight.duration(200)}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        onStartShouldSetResponder={(evt: GestureResponderEvent) => {
          evt.persist();

          // if press outside, execute onPressOutside callback
          if (
            drawerRef &&
            !isTapInsideComponent(evt.target, drawerRef.current || drawerRef)
          ) {
            setShowDrawer(false);
          }

          return true;
        }}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          width="100%"
          justifyContent="flex-end"
          flexDirection="row"
          height="100%"
        >
          <Box
            ref={drawerRef}
            backgroundColor="olive100"
            width={240}
            height="100%"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={0.2}
            shadowRadius={5}
            elevation={10}
          >
            <SafeAreaView>
              <Box
                width="100%"
                flexDirection="row"
                justifyContent="flex-end"
                px={4}
                pt={1}
              >
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => {
                    setShowDrawer(false);
                  }}
                >
                  <BxX height={32} width={32} color="black" />
                </TouchableOpacity>
              </Box>
              <Box px={4} pt={4}>
                <Button
                  variant="outline"
                  onPress={() => {
                    signOut();
                    setShowDrawer(false);
                  }}
                >
                  Sign out
                </Button>
              </Box>
            </SafeAreaView>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}
