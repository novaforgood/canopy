import { useNavigation } from "@react-navigation/native";
import OutsidePressHandler from "react-native-outside-press";
import React, { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { Box } from "./atomic/Box";
import { Text } from "./atomic/Text";
import { BxX } from "../generated/icons/regular";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./atomic/Button";
import { signOut } from "../lib/firebase";
import { useUserData } from "../hooks/useUserData";
import { NavigationProp } from "../navigation/types";

export function NavDrawer() {
  const [showDrawer, setShowDrawer] = useState(false);
  const { userData } = useUserData();
  const drawerRef = useRef(null);
  const navigation = useNavigation<NavigationProp>();

  return (
    <Box>
      {showDrawer && (
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
          <OutsidePressHandler
            disabled={false}
            onOutsidePress={() => {
              setShowDrawer(false);
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
                  <Text px={4} pt={4}>
                    Logged in as {userData?.first_name} {userData?.last_name}
                  </Text>
                  <Box px={4} pt={4}>
                    <Button
                      variant="outline"
                      onPress={() => {
                        navigation.navigate("Home");
                        setShowDrawer(false);
                      }}
                    >
                      Change directory
                    </Button>
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
          </OutsidePressHandler>
        </Animated.View>
      )}
    </Box>
  );
}
