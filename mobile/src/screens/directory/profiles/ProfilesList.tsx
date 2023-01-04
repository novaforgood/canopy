import {
  useNavigation,
  useNavigationState,
  useRoute,
} from "@react-navigation/native";
import { getDayOfYear } from "date-fns";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Fuse from "fuse.js";

import { Box } from "../../../components/atomic/Box";
import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import {
  filteredProfileIdsAtom,
  searchQueryAtom,
  selectedTagIdsAtom,
} from "../../../lib/jotai";
import { ProfileCard } from "./ProfileCard";
import { NavigationProp } from "../../../navigation/types";
import { TextInput } from "../../../components/atomic/TextInput";
import { HtmlDisplay } from "../../../components/HtmlDisplay";
import { Text } from "../../../components/atomic/Text";
import { SpaceCoverPhoto } from "../../../components/SpaceCoverPhoto";

import { CustomKeyboardAvoidingView } from "../../../components/CustomKeyboardAvoidingView";
import { SelectAutocomplete } from "../../../components/atomic/SelectAutocomplete";
import { FilterBar } from "./FilterBar";
import { getCurrentUser } from "../../../lib/firebase";

const FUSE_OPTIONS = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: [
    "profile.user.first_name",
    "profile.user.last_name",
    "headline",
    "profile_listing_to_space_tags.space_tag.label",
  ],
};

export function ProfilesList() {
  const navigation = useNavigation<NavigationProp>();
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole, currentProfile } = useCurrentProfile();

  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);

  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);

  const [{ data: profileListingData, fetching: fetchingProfileListings }] =
    useProfileListingsInSpaceQuery({
      pause: !currentSpace,
      variables: {
        where: {
          profile: {
            space_id: { _eq: currentSpace?.id },
            flattened_profile_roles: {
              profile_role: { _eq: Profile_Role_Enum.MemberWhoCanList },
            },
          },
          public: { _eq: true },
          // filter by tags if tags selected
          ...(Array.from(selectedTagIds).length > 0
            ? {
                _and: Array.from(selectedTagIds).map((tagId) => ({
                  profile_listing_to_space_tags: {
                    space_tag_id: { _eq: tagId },
                  },
                })),
              }
            : undefined),
        },
      },
    });

  const allProfileListings = useMemo(
    () => profileListingData?.profile_listing ?? [],
    [profileListingData?.profile_listing]
  );

  const filteredProfileListings = useMemo(() => {
    if (searchQuery === "")
      return shuffleProfiles(allProfileListings, getDayOfYear(new Date()));

    const searchQueryLower = searchQuery.toLowerCase();
    const fuse = new Fuse(allProfileListings, FUSE_OPTIONS);

    return fuse.search(searchQueryLower).map((result) => result.item);
  }, [allProfileListings, searchQuery]);

  const [_, setFilteredProfileIds] = useAtom(filteredProfileIdsAtom);
  useEffect(() => {
    setFilteredProfileIds(
      filteredProfileListings.map((listing) => listing.profile.id)
    );
  }, [filteredProfileListings]);

  return (
    <CustomKeyboardAvoidingView>
      <ScrollView style={{ height: "100%" }}>
        <Box
          flexDirection="column"
          borderBottomWidth={1}
          borderColor="green700"
          borderTopWidth={1}
        >
          <SpaceCoverPhoto
            src={currentSpace?.space_cover_image?.image.url}
          ></SpaceCoverPhoto>
          <Box py={6} pb={12} px={4} backgroundColor="olive100">
            <Text mb={2} variant="heading3">
              {currentSpace?.name}
            </Text>
            <HtmlDisplay html={currentSpace?.description_html ?? ""} />
          </Box>
        </Box>
        <Box p={4} backgroundColor="gray50" minHeight={600}>
          <Text mt={4} color="gray800" variant="body1Medium">
            Search / filter
          </Text>

          <FilterBar />

          <Text mt={8} color="gray800" variant="body1Medium">
            Results
          </Text>

          <Box mt={2}></Box>
          {filteredProfileListings.length === 0 && (
            <Text mt={4} color="gray500" variant="body1Italic">
              No results
            </Text>
          )}
          {filteredProfileListings.map((listing, idx) => {
            const { first_name, last_name } = listing.profile.user;

            const tagNames =
              listing.profile_listing_to_space_tags?.map(
                (tag) => tag.space_tag.label
              ) ?? [];

            return (
              <ProfileCard
                key={listing.id}
                id={listing.id}
                onPress={() => {
                  // router.push(
                  //   `${router.asPath}/profile/${listing.profile.id}`
                  // );
                  navigation.navigate("ProfilePage", {
                    profileId: listing.profile.id,
                  });
                }}
                name={`${first_name} ${last_name}`}
                imageUrl={listing.profile_listing_image?.image.url}
                subtitle={listing.headline}
                descriptionTitle={"Topics"}
                tags={tagNames}
              />
            );
          })}
        </Box>
      </ScrollView>
    </CustomKeyboardAvoidingView>
  );
}

// code for shuffling based on seed taken from
// https://stackoverflow.com/a/53758827

function shuffleProfiles<T>(array: T[], seed: number) {
  let m = array.length;
  let t;
  let i;

  while (m) {
    i = Math.floor(random(seed) * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed;
  }

  return array;
}

function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
