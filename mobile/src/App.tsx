import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";
import { Asset } from "expo-asset";
import {
  Rubik_400Regular,
  Rubik_700Bold,
  Rubik_500Medium,
  Rubik_400Regular_Italic,
  Rubik_700Bold_Italic,
  Rubik_500Medium_Italic,
} from "@expo-google-fonts/rubik";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
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
import { sessionAtom, showNavDrawerAtom } from "./lib/jotai";
import Animated, {
  SlideInRight,
  SlideOutRight,
  FadeOut,
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import Constants from "expo-constants";
import { Box } from "./components/atomic/Box";
import { Text } from "./components/atomic/Text";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { BxX } from "./generated/icons/regular";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./components/atomic/Button";
import { onAuthStateChanged, signOut } from "./lib/firebase";
import { CustomToast } from "./components/CustomToast";
import * as SplashScreen from "expo-splash-screen";
import { useIsLoggedIn } from "./hooks/useIsLoggedIn";
import { useRefreshSession } from "./hooks/useRefreshSession";
import splashImage from "../assets/images/splash.png";
import { useUserData } from "./hooks/useUserData";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const isLoggedIn = useIsLoggedIn();
  const [session, setSession] = useAtom(sessionAtom);

  const { refreshSession } = useRefreshSession();

  useEffect(() => {
    const unsubscribeListener = onAuthStateChanged(async () => {
      // Whenever auth state changes, we no longer know what the session is.
      // We must wait for this handler to run to completion, resolving
      // the session to either authenticated or null.
      setSession(undefined);
      refreshSession();
    });

    return () => {
      unsubscribeListener();
    };
  }, [refreshSession, setSession]);

  const sessionLoaded = session !== undefined;
  const appIsReady = fontsLoaded && sessionLoaded;

  return (
    <AnimatedAppLoader
      isAppReady={appIsReady}
      imageUri={Image.resolveAssetSource(splashImage).uri}
    >
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </AnimatedAppLoader>
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
  const { userData } = useUserData();
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
              <Text>
                {userData?.first_name} {userData?.last_name}
              </Text>
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

function AnimatedAppLoader({
  children,
  imageUri,
  isAppReady,
}: {
  children: ReactNode;
  imageUri: string;
  isAppReady: boolean;
}) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.fromURI(imageUri).downloadAsync();
      setSplashReady(true);
    }

    prepare();
  }, [imageUri]);

  if (!isSplashReady) {
    return null;
  }

  return (
    <AnimatedSplashScreen imageUri={imageUri} isAppReady={isAppReady}>
      {children}
    </AnimatedSplashScreen>
  );
}

function AnimatedSplashScreen({
  children,
  imageUri,
  isAppReady,
}: {
  children: ReactNode;
  imageUri: string;
  isAppReady: boolean;
}) {
  const animation = useSharedValue(1);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      animation.value = withTiming(0, { duration: 500 });
    }
  }, [isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync().catch(() => {});
      // Load stuff
    } catch (e) {
      // handle errors
    } finally {
      setImageLoaded(true);
    }
  }, []);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
      opacity: animation.value,
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      width: "100%",
      height: "100%",
      resizeMode: Constants.expoConfig?.splash?.resizeMode || "contain",
      transform: [
        {
          scale: 2 - animation.value,
        },
      ],
    };
  });

  const appReady = isAppReady && imageLoaded;

  return (
    <View style={{ flex: 1 }}>
      {appReady && children}
      <Animated.View pointerEvents="none" style={backgroundStyle}>
        <Animated.Image
          style={imageStyle}
          source={{ uri: imageUri }}
          onLoadEnd={onImageLoaded}
          fadeDuration={0}
        />
      </Animated.View>
    </View>
  );
}
