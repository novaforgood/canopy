import type { StackScreenProps } from "@react-navigation/stack";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import type { RootStackParams } from "../types/navigation";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import { BxCog } from "../generated/icons/regular";

function HomeScreen({ navigation }: StackScreenProps<RootStackParams, "Home">) {
  const spaces = [{ spaceSlug: "test-space-1", spaceName: "Test Space 1" }];

  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  return (
    <Box p={4}>
      <Box>
        <Text variant="heading4">
          Welcome to Canopy Mobile, {userData?.first_name}!
        </Text>
        <ScrollView>
          {profileData?.profile.map((profile) => {
            return (
              <Box key={profile.id}>
                <Image
                  style={{ width: 50, height: 50 }}
                  source={{
                    uri: profile.space.space_cover_image?.image.url,
                  }}
                />
                <Box height={10} width={10}>
                  <BxCog />
                </Box>
                <Button
                  onPress={() => {
                    navigation.navigate("Directory", {
                      spaceSlug: profile.space.slug,
                    });
                  }}
                >
                  {profile.space.name}
                </Button>
              </Box>
            );
          })}
        </ScrollView>
      </Box>
    </Box>
  );
}

export default HomeScreen;
