import type { StackScreenProps } from "@react-navigation/stack";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { useProfileByIdQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import type { RootStackParamList } from "../navigation/types";
import { ScrollView, SafeAreaView } from "react-native";
import { BxEdit, BxMessageDetail } from "../generated/icons/regular";
import { ProfileImage } from "../components/ProfileImage";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { HtmlDisplay } from "../components/HtmlDisplay";
import { Tag } from "../components/Tag";
import { ProfileSocialsDisplay } from "../components/profile-socials/ProfileSocialsDisplay";

export function ProfilePageScreen({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "ProfilePage">) {
  const { profileId } = route.params;

  const { userData } = useUserData();

  const isLoggedIn = useIsLoggedIn();
  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const isMyProfile = profileId === currentProfile?.id;

  if (!currentSpace) {
    return null;
  }

  if (!profileData?.profile_by_pk?.profile_listing && !fetchingProfileData) {
    return null;
  }

  const listing = profileData?.profile_by_pk?.profile_listing;
  const { first_name, last_name, email } =
    profileData?.profile_by_pk?.user ?? {};

  const profileTagIds = new Set(
    listing?.profile_listing_to_space_tags.map((item) => item.space_tag_id)
  );

  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box
          flexDirection="column"
          width="100%"
          backgroundColor="white"
          pb={12}
        >
          <Box p={4} pt={8}>
            <Box>
              <Box flexDirection="row" alignItems="center" mb={4}>
                <ProfileImage
                  src={listing?.profile_listing_image?.image.url}
                  alt={`${first_name} ${last_name}`}
                  height={100}
                  width={100}
                />
                <Box mt={4} ml={6} flexDirection="column">
                  <Text variant="heading4">
                    {first_name} {last_name}
                  </Text>
                  <Text mt={1} variant="body1">
                    {listing?.headline}
                  </Text>
                </Box>
              </Box>
              {isMyProfile ? (
                <Button
                  onPress={() => {
                    console.log("Go to my edit profile page");
                  }}
                >
                  Edit profile
                </Button>
              ) : (
                <Button
                  flexDirection="row"
                  alignItems="center"
                  borderRadius="full"
                  onPress={() => {
                    console.log("Nav to chat room");
                  }}
                  disabled={isMyProfile}
                >
                  Message
                </Button>
              )}
            </Box>

            <Box mt={8}>
              <Box flexDirection="column">
                {listing?.profile_listing_responses.map((response) => {
                  return (
                    <Box key={response.id} mt={8}>
                      <Text mb={1} variant="heading4" color="green800">
                        {response.space_listing_question.title}
                      </Text>
                      <HtmlDisplay html={response.response_html} />
                    </Box>
                  );
                })}
              </Box>
              <Box>
                <Box flexDirection="column" borderRadius="md" mt={4}>
                  {currentSpace?.space_tag_categories?.map((category) => {
                    const tags = category.space_tags.filter((tag) =>
                      profileTagIds.has(tag.id)
                    );
                    return (
                      <Box key={category.id} mt={8}>
                        <Text variant="heading4" color="green800">
                          {category.title}
                        </Text>

                        <Box mt={4} flexWrap="wrap" flexDirection="row">
                          {tags.length > 0 ? (
                            tags.map((tag) => {
                              return (
                                <Box mb={1} mr={1} key={tag.id}>
                                  <Tag text={tag.label ?? ""} />
                                </Box>
                              );
                            })
                          ) : (
                            <Text variant="body1Italic" color="gray700">
                              No tags
                            </Text>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                <Box mt={8} borderRadius="md">
                  <Text variant="heading4" color="green800">
                    Profiles
                  </Text>
                  <Text my={4}>{email}</Text>

                  <ProfileSocialsDisplay
                    profileListingId={listing?.id ?? ""}
                    email={email}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
