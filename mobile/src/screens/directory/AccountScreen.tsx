import { useNavigation } from "@react-navigation/native";
import { Linking, SafeAreaView, ScrollView, View } from "react-native";

import { Box } from "../../components/atomic/Box";
import { Button } from "../../components/atomic/Button";
import { Text } from "../../components/atomic/Text";
import { ProfileImage } from "../../components/ProfileImage";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useUserData } from "../../hooks/useUserData";
import { signOut } from "../../lib/firebase";
import { HOST_URL } from "../../lib/url";
import { NavigationProp } from "../../navigation/types";

export function AccountScreen() {
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();

  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box backgroundColor="olive50" minHeight="100%" p={4}>
          <Box flexDirection="row" alignItems="center" mb={4}>
            <ProfileImage
              height={40}
              width={40}
              src={
                currentProfile?.profile_listing?.profile_listing_image?.image
                  .url
              }
            ></ProfileImage>

            <Text ml={3} variant="subheading1">
              {userData?.first_name} {userData?.last_name}
            </Text>
          </Box>
          <Text variant="body1">
            You are logged in to{" "}
            <Text variant="body1Medium">{currentSpace?.name}</Text> as{" "}
            {userData?.first_name} {userData?.last_name}.
          </Text>

          <Text mt={8} color="gray700" variant="body2Italic">
            To edit your profile and settings, you will be redirected to the
            Canopy web app.
          </Text>

          <Button
            mt={4}
            onPress={() => {
              const url = `${HOST_URL}/space/${currentSpace?.slug}/account/profile`;
              Linking.openURL(url);
            }}
          >
            Edit Profile
          </Button>
          <Button
            mt={4}
            onPress={() => {
              const url = `${HOST_URL}/space/${currentSpace?.slug}/account/settings`;
              Linking.openURL(url);
            }}
          >
            Edit Settings
          </Button>

          <Button
            variant="outline"
            mt={16}
            onPress={() => {
              navigation.navigate("Home");
            }}
          >
            Change directory
          </Button>
          <Button
            mt={4}
            variant="outline"
            onPress={() => {
              signOut();
            }}
          >
            Sign out
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
