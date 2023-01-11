import React, { useEffect } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackScreenProps } from "@react-navigation/stack";
import { useTheme } from "@shopify/restyle";
import { useAtom } from "jotai";
import { TouchableOpacity } from "react-native";

import { Box } from "../components/atomic/Box";
import { useSpaceBySlugQuery } from "../generated/graphql";
import { BxMenu } from "../generated/icons/regular";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser, signOut } from "../lib/firebase";
import { currentSpaceAtom, sessionAtom, showNavDrawerAtom } from "../lib/jotai";
import { ChatRoomScreen } from "../screens/ChatRoomScreen";
import { ProfilePageScreen } from "../screens/ProfilePageScreen";
import { Theme } from "../theme";

import { SpaceBottomTabNavigator } from "./SpaceBottomTabNavigator";
import { RootStackParamList, SpaceStackParamList } from "./types";

const SpaceStack = createNativeStackNavigator<SpaceStackParamList>();

export function SpaceNavigator({
  route,
}: StackScreenProps<RootStackParamList, "SpaceHome">) {
  const theme = useTheme<Theme>();
  const [showDrawer, setShowDrawer] = useAtom(showNavDrawerAtom);

  ///// Force update JWT if user changed space /////
  const { refreshSession } = useRefreshSession();
  const [session, setSession] = useAtom(sessionAtom);
  const { spaceSlug } = route.params;

  const [{ data: spaceData }, executeQuery] = useSpaceBySlugQuery({
    pause: true,
    variables: { slug: spaceSlug ?? "" },
  });
  useEffect(() => {
    // Update space data when slug changes to a non-empty string.
    if (spaceSlug) {
      console.log("Re-executing space lazy query...");
      executeQuery();
    }
  }, [spaceSlug, executeQuery]);

  const spaceId = spaceData?.space[0]?.id;

  useEffect(() => {
    const attemptRefreshJwt = async () => {
      const idToken = await getCurrentUser()?.getIdTokenResult();
      if (!idToken) {
        signOut();
        return;
      }

      const claimsSpaceId = (
        idToken.claims["https://hasura.io/jwt/claims"] as {
          ["x-hasura-space-id"]: string;
        }
      )["x-hasura-space-id"];

      if (spaceId === claimsSpaceId) {
        return;
      } else {
        if (spaceId) {
          console.log("Refreshing JWT due to spaceId change...");
          refreshSession({ forceUpdateJwt: true, spaceId: spaceId });
        }
      }
    };
    attemptRefreshJwt();
  }, [spaceId, setSession, refreshSession]);

  // Update current space atom
  const [currSpace, setCurrSpace] = useAtom(currentSpaceAtom);
  useEffect(() => {
    const space = spaceData?.space[0];
    if (space) {
      setCurrSpace({
        slug: space.slug,
        name: space.name,
      });
    } else {
      setCurrSpace(undefined);
    }
  }, [setCurrSpace, spaceData?.space]);

  return (
    <>
      <SpaceStack.Navigator
        initialRouteName="SpaceBottomTabs"
        screenOptions={{
          headerBackground: () => (
            <Box
              backgroundColor="olive100"
              height="100%"
              width="100%"
              shadowColor="black"
              borderBottomColor="olive200"
              borderBottomWidth={1}
            />
          ),
          title: currSpace?.name,
          headerTintColor: theme.colors.green800,
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowDrawer(true);
                }}
              >
                <BxMenu
                  height={28}
                  width={28}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  color="black"
                />
              </TouchableOpacity>
            </>
          ),
        }}
      >
        <SpaceStack.Screen
          name="SpaceBottomTabs"
          component={SpaceBottomTabNavigator}
          options={({ route }) => ({})}
        />

        <SpaceStack.Screen
          name="ProfilePage"
          component={ProfilePageScreen}
          options={({ route }) => ({
            // title: `${route.params.firstName} ${route.params.lastName}`,
            title: "",
            headerBackTitle: "Back",
            animationTypeForReplace: "push",
          })}
        />
        <SpaceStack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={({ route }) => ({
            // title: route.params.chatRoomName,
            title: "",
            headerBackTitle: "Back",
            headerBackground: () => (
              <Box
                backgroundColor="olive100"
                height="100%"
                width="100%"
                shadowColor="black"
                flexDirection="row"
              ></Box>
            ),
          })}
        />
      </SpaceStack.Navigator>
    </>
  );
}
