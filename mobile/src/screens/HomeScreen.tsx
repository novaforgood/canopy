import { useNavigation } from "@react-navigation/native";
import { useAtom } from "jotai";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { SpaceCoverPhoto } from "../components/SpaceCoverPhoto";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxCog } from "../generated/icons/regular";
import { BxsGroup } from "../generated/icons/solid";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";
import { currentSpaceAtom } from "../lib/jotai";
import { NavigationProp, RootStackParamList } from "../navigation/types";

import type { StackScreenProps } from "@react-navigation/stack";

export function HomeScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "Home">) {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box p={4}>
          <Text variant="heading4Medium" mt={4}>
            Your Canopy Directories
          </Text>
          <Box mt={2}>
            <Text>
              Below are the communities you are a part of. Tap a community to
              see inside.
            </Text>
          </Box>
          <Box mt={4} flexWrap="wrap" flexDirection="row">
            {profileData?.profile.map((profile) => {
              return (
                <Box
                  mt={2}
                  mr={2}
                  borderRadius="sm"
                  overflow="hidden"
                  width="47%"
                  key={profile.id}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("SpaceHome", {
                        spaceSlug: profile.space.slug,
                        spaceName: profile.space.name,
                      });
                    }}
                  >
                    <Box>
                      <SpaceCoverPhoto
                        src={profile.space.space_cover_image?.image.url}
                      />
                      <Box
                        padding={2}
                        flexDirection="row"
                        alignItems="center"
                        backgroundColor="white"
                      >
                        <BxsGroup height={16} width={16} color="black" />
                        <Text variant="body1" ml={2}>
                          {profile.space.name}
                        </Text>
                      </Box>
                    </Box>
                  </TouchableOpacity>
                </Box>
              );
            })}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
