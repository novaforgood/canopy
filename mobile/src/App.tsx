import React, { ReactNode, useCallback, useEffect, useState } from "react";

import {
  Rubik_400Regular,
  Rubik_700Bold,
  Rubik_500Medium,
  Rubik_400Regular_Italic,
  Rubik_700Bold_Italic,
  Rubik_500Medium_Italic,
} from "@expo-google-fonts/rubik";
import {
  LinkingOptions,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { useAtom } from "jotai";
import { Alert, Image, StatusBar, View } from "react-native";
import { setJSExceptionHandler } from "react-native-exception-handler";
import { EventProvider } from "react-native-outside-press";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import splashImage from "../assets/images/splash.png";

import { CustomToast } from "./components/CustomToast";
import { NavDrawer } from "./components/NavDrawer";
import { useExpoUpdate } from "./hooks/useExpoUpdate";
import { useIsLoggedIn } from "./hooks/useIsLoggedIn";
import { useRefreshSession } from "./hooks/useRefreshSession";
import { onAuthStateChanged } from "./lib/firebase";
import { sessionAtom } from "./lib/jotai";
import { HOST_URL } from "./lib/url";
import { RootNavigator } from "./navigation/RootNavigator";
import { RootStackParamList } from "./navigation/types";
import { UrqlProvider } from "./providers/UrqlProvider";
import { theme } from "./theme";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const errorHandler = (e: Error, isFatal: boolean) => {
  if (isFatal) {
    Alert.alert("Unexpected error occurred", `${e.message}`, [
      {
        text: "Close",
        onPress: () => {
          // do nothing
        },
      },
    ]);
  } else {
    console.log("Uncaught error", e); // So that we can see it in the ADB logs in case of Android if needed
  }
};
setJSExceptionHandler(errorHandler, true);

const prefix = Linking.createURL("");
const scheme = prefix.split("://")[0]; // For example, "joincanopy:// -> joincanopy"

const linking: LinkingOptions<{
  SpaceHome: NavigatorScreenParams<{
    ChatRoom: { chatRoomId: string };
    ProfilePage: { profileId: string };
  }>;
}> = {
  prefixes: [
    prefix,
    `https://*.canopy-git-dev-novaforgood.vercel.app/go/${scheme}`,
    `https://canopy-git-dev-novaforgood.vercel.app/go/${scheme}`,
    `https://joincanopy.org/go/${scheme}`,
    `https://*.joincanopy.org/go/${scheme}`,
  ],
  config: {
    screens: {
      // ProfilePage: {
      //   path: `${scheme}/space/:spaceSlug/profile/:profileId`,
      //   parse: {},
      // },
      // ChatRoom: `${scheme}/space/:spaceSlug/chat/:chatRoomId`,
      SpaceHome: {
        path: "/space/:spaceSlug",
        screens: {
          ChatRoom: {
            path: "chat/:chatRoomId",
          },
          ProfilePage: {
            path: "profile/:profileId",
          },
        },
      },
    },
  },
};

function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
    Rubik_500Medium,
    Rubik_400Regular_Italic,
    Rubik_700Bold_Italic,
    Rubik_500Medium_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
            <NavigationContainer linking={linking}>
              <EventProvider style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <RootNavigator />
                <NavDrawer />
              </EventProvider>
            </NavigationContainer>
            <CustomToast />
          </ThemeProvider>
        </UrqlProvider>
      </SafeAreaProvider>
    </AnimatedAppLoader>
  );
}

export default App;

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
  const [imageLoaded, setImageLoaded] = useState(false);

  const animation = useSharedValue(1);
  useEffect(() => {
    if (isAppReady) {
      animation.value = withTiming(0, { duration: 300 });
    }
  }, [animation, isAppReady]);

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
