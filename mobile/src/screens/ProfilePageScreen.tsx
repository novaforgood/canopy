import { useEffect, useState } from "react";

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
import {
  NavigationProp,
  RootStackParamList,
  SpaceStackParamList,
} from "../navigation/types";

import { MessageModal } from "./MessageModal";

import type { StackScreenProps } from "@react-navigation/stack";

export function ProfilePageScreen({
  route,
  navigation,
}: StackScreenProps<SpaceStackParamList, "ProfilePage">) {
  const { profileId } = route.params;

  const globalNavigation = useNavigation<NavigationProp>();

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
  //for testing

  console.log("PROFILE DATA 0")
  const [count, setCount] = useState(0);
  useEffect(()=> {
    console.log("PROFILE DATA 1")
    setCount(count + 1);
    if(profileData != null) {
      console.log("PROFILE DATA")
      console.log(profileData)
    }
  })
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
  console.log("Hey!");
  console.log(listing.__typename);
  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box flexDirection="column" width="100%">
          <Box backgroundColor="gray50" px={4} pt={8} pb={8}>
            <Box flexDirection="column" alignItems="center" mb={6}>
              <ProfileImage
                showLightbox
                src={listing?.profile_listing_image?.image.url}
                alt={`${first_name} ${last_name}`}
                height={150}
                width={150}
              />
              <Box mt={2} flexDirection="column" alignItems="center">
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
                  {listing?.headline ?? "‎"}
                </Text>
              </Box>
            </Box>
            {isMyProfile ? (
              <Button
                onPress={() => {
                  globalNavigation.navigate("Account");
                }}
                variant="cta"
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
                    });
                  }
                }}
                disabled={isMyProfile}
                variant="cta"
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
            pb={8}
            pt={4}
            backgroundColor="gray50"
          >
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={() => {
                navigation.setParams({ profileId: prevProfileId });
              }}
              disabled={prevDisabled}
            >
              <Text color={prevDisabled ? "gray500" : "black"}>
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
              <Text color={nextDisabled ? "gray500" : "black"}>Next {">"}</Text>
            </TouchableOpacity>
          </Box>

          <Box backgroundColor="gray50">
            <Box
              m={4}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
              elevation={1}
              borderRadius="md"
              px={4}
              pb={8}
              flexDirection="column"
              backgroundColor="white"
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
              m={4}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
              elevation={1}
              borderRadius="md"
              px={4}
              pb={8}
              flexDirection="column"
              backgroundColor="white"
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
              m={4}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
              elevation={1}
              borderRadius="md"
              px={4}
              py={8}
              flexDirection="column"
              backgroundColor="white"
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
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
