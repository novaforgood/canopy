import {
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { SpaceCoverPhoto } from "../components/SpaceCoverPhoto";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxsGroup } from "../generated/icons/solid";
import { useUserData } from "../hooks/useUserData";
import { HOST_URL } from "../lib/url";
import { RootStackParamList } from "../navigation/types";

import type { StackScreenProps } from "@react-navigation/stack";

export function HomeScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "Home">) {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  console.log("profileData", profileData);

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
            {profileData?.profile.length === 0 && (
              <Box>
                <Text color="gray700">
                  You are not a part of any communities yet. Join or create a
                  directory to see it here.
                </Text>
              </Box>
            )}
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
          <Button
            variant="outline"
            mt={12}
            onPress={() => {
              const url = `${HOST_URL}/create`;
              Linking.openURL(url);
            }}
          >
            Create a new directory
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
