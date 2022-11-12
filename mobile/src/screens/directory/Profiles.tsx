import {
  useNavigation,
  useNavigationState,
  useRoute,
} from "@react-navigation/native";
import { getDayOfYear } from "date-fns";
import { useAtom } from "jotai";
import { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Fuse from "fuse.js";

import { Box } from "../../components/atomic/Box";
import { Text } from "../../components/atomic/Text";
import { ProfileImage } from "../../components/ProfileImage";
import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { BxX } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { searchQueryAtom } from "../../lib/jotai";

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

function Profiles() {
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

export default Profiles;

interface ProfileCardProps {
  imageUrl?: string;
  name: string;
  subtitle?: string | null;
  descriptionTitle: string;
  tags?: string[];
  onPress?: () => void;
  id: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    subtitle,
    descriptionTitle,
    imageUrl,
    tags = [],
    onPress = () => {},
    id,
  } = props;

  const numTags = 3;
  const remainingTags = tags.length - numTags;
  const processedTags = tags.slice(0, numTags);
  if (remainingTags > 0) {
    processedTags.push(`+${remainingTags} more…`);
  }

  return (
    <Pressable onPress={onPress}>
      <Box
        mb={4}
        flexDirection="column"
        alignItems="flex-start"
        borderRadius="md"
        borderWidth={1}
        borderColor="gray400"
        backgroundColor="white"
      >
        <Box pb={4} width="100%">
          <ProfileImage
            width={"100%"}
            rounded={false}
            border={false}
            src={imageUrl}
            alt={name}
          />
        </Box>
        <Box flexDirection="column" alignItems="flex-start" px={4} width="100%">
          <Text variant="heading4" color="gray900">
            {name}
          </Text>
          {subtitle && (
            <Text mt={1} color="gray900" variant="body2">
              {subtitle}
            </Text>
          )}
          <Text mt={4} variant="body2Medium">
            {descriptionTitle}
          </Text>
          <Box height={1.5}></Box>
          <Box flexDirection="row" flexWrap="wrap" overflow="hidden" mb={4}>
            {processedTags.length > 0 ? (
              processedTags.map((tag, index) => (
                <Box mt={1} ml={1}>
                  <Tag key={index} text={tag} variant="outline" />
                </Box>
              ))
            ) : (
              <Text color="gray500" variant="body1Italic">
                none
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

export interface TagProps {
  text: string;
  onDeleteClick?: () => void;
  renderRightIcon?: () => React.ReactNode;
  variant?: "primary" | "outline";
}
export function Tag(props: TagProps) {
  const { text, renderRightIcon, onDeleteClick, variant = "primary" } = props;

  return (
    <Box backgroundColor="lime200" borderRadius="full" px={3} py={1}>
      <Text variant="body1Medium" color="olive700">
        {text}
      </Text>
      {renderRightIcon
        ? renderRightIcon()
        : onDeleteClick && (
            <BxX height={12} width={12} color="black" onPress={onDeleteClick} />
          )}
    </Box>
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
