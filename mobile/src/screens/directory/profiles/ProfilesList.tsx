import {
  useNavigation,
  useNavigationState,
  useRoute,
} from "@react-navigation/native";
import { getDayOfYear } from "date-fns";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import Fuse from "fuse.js";

import { Box } from "../../../components/atomic/Box";
import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { searchQueryAtom } from "../../../lib/jotai";
import { ProfileCard } from "./ProfileCard";
import { NavigationProp } from "../../../navigation/types";

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

  const [searchQuery] = useAtom(searchQueryAtom);

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

  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box p={4}>
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
                    firstName: first_name ?? "",
                    lastName: last_name ?? "",
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
    </SafeAreaView>
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
