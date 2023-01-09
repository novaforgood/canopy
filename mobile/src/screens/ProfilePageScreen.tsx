import { useEffect } from "react";

import { useDisclosure } from "@mantine/hooks";
import { useNavigation } from "@react-navigation/native";
import { useAtom } from "jotai";
import { ScrollView, SafeAreaView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { HtmlDisplay } from "../components/HtmlDisplay";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ProfileSocialsDisplay } from "../components/profile-socials/ProfileSocialsDisplay";
import { ProfileImage } from "../components/ProfileImage";
import { Tag } from "../components/Tag";
import { useProfileByIdQuery } from "../generated/graphql";
import { BxSend } from "../generated/icons/regular";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useProfileViewTracker } from "../hooks/useProfileViewTracker";
import { useUserData } from "../hooks/useUserData";
import { filteredProfileIdsAtom } from "../lib/jotai";
import { NavigationProp, RootStackParamList } from "../navigation/types";

import { MessageModal } from "./MessageModal";

import type { StackScreenProps } from "@react-navigation/stack";

export function ProfilePageScreen({
  route,
}: StackScreenProps<RootStackParamList, "ProfilePage">) {
  const { profileId } = route.params;

  const navigation = useNavigation<NavigationProp>();

  const isLoggedIn = useIsLoggedIn();

  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [messageModalOpen, messageModalHandlers] = useDisclosure(false);

  const { attemptTrackView } = useProfileViewTracker();
  useEffect(() => {
    if (!profileId) {
      return;
    }
    if (!currentProfile?.id) {
      return;
    }

    // This should only run once per page load.
    attemptTrackView(profileId, currentProfile.id);
  }, [attemptTrackView, currentProfile?.id, profileId]);

  const [filteredProfileIds] = useAtom(filteredProfileIdsAtom);
  const indexOfProfile = filteredProfileIds.indexOf(profileId);
  const nextDisabled = indexOfProfile === filteredProfileIds.length - 1;
  const nextProfileId = filteredProfileIds[indexOfProfile + 1];
  const prevDisabled = indexOfProfile === 0;
  const prevProfileId = filteredProfileIds[indexOfProfile - 1];

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
        <Box flexDirection="column" width="100%" backgroundColor="white">
          <Box
            backgroundColor="white"
            px={4}
            pt={8}
            pb={8}
            borderBottomWidth={1}
            borderColor="green700"
          >
            <Box flexDirection="row" alignItems="center" mb={6}>
              <ProfileImage
                showLightbox
                src={listing?.profile_listing_image?.image.url}
                alt={`${first_name} ${last_name}`}
                height={120}
                width={120}
              />
              <Box mt={4} ml={6} flexDirection="column">
                <Text
                  variant="heading4"
                  color="black"
                  loading={fetchingProfileData}
                  loadingWidth={100}
                >
                  {first_name} {last_name}
                </Text>
                <Text
                  mt={1}
                  variant="body1"
                  color="gray800"
                  loading={fetchingProfileData}
                  loadingWidth={120}
                >
                  {listing?.headline}
                </Text>
              </Box>
            </Box>
            {isMyProfile ? (
              <Button
                onPress={() => {
                  navigation.navigate("Account");
                }}
                variant="outline"
              >
                Edit profile
              </Button>
            ) : (
              <Button
                flexDirection="row"
                alignItems="center"
                borderRadius="full"
                onPress={() => {
                  const chatRoomId =
                    profileData?.profile_to_chat_room?.[0]?.chat_room_id;

                  if (!chatRoomId) {
                    messageModalHandlers.open();
                  } else {
                    navigation.navigate("ChatRoom", {
                      chatRoomId,
                      chatRoomName: `${first_name} ${last_name}`,
                    });
                  }
                }}
                disabled={isMyProfile}
                variant="outline"
              >
                <Box flexDirection="row">
                  <Text variant="body1">Message</Text>
                  <Box ml={1.5} mr={-1.5} height={18} width={18}>
                    <BxSend height="100%" width="100%" color="black" />
                  </Box>
                </Box>
              </Button>
            )}
          </Box>

          <MessageModal
            isOpen={messageModalOpen}
            onClose={messageModalHandlers.close}
            onMessageSent={refetchProfileById}
            profileId={profileId}
          />

          <Box
            flexDirection="row"
            justifyContent="space-between"
            px={4}
            py={4}
            backgroundColor="green300"
            borderBottomWidth={1}
            borderBottomColor="green700"
          >
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={() => {
                navigation.setParams({ profileId: prevProfileId });
              }}
              disabled={prevDisabled}
            >
              <Text color={prevDisabled ? "green500" : "green800"}>
                {"<"} Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={() => {
                navigation.setParams({ profileId: nextProfileId });
              }}
              disabled={nextDisabled}
            >
              <Text color={nextDisabled ? "green500" : "green800"}>
                Next {">"}
              </Text>
            </TouchableOpacity>
          </Box>

          <Box
            px={4}
            pb={8}
            flexDirection="column"
            borderBottomWidth={1}
            backgroundColor="lime100"
            borderBottomColor="green700"
          >
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

          <Box
            flexDirection="column"
            px={4}
            pb={8}
            borderBottomWidth={1}
            borderBottomColor="green700"
            backgroundColor="gray100"
          >
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
          <Box
            mt={8}
            pb={16}
            px={4}
            borderBottomWidth={1}
            borderBottomColor="green700"
          >
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
      </ScrollView>
    </SafeAreaView>
  );
}
