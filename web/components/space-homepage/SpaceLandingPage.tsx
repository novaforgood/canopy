import { useMemo, useState } from "react";

import { closestCenter, DndContext, MeasuringStrategy } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { addDays, format, getDayOfYear } from "date-fns";
import Fuse from "fuse.js";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";

import { useProfileByIdQuery } from "../../generated/graphql";
import { useAllProfilesOfUserQuery } from "../../generated/graphql";
import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrivacySettings } from "../../hooks/usePrivacySettings";
import { useQueryParam } from "../../hooks/useQueryParam";
import { useUserData } from "../../hooks/useUserData";
import {
  adminBypassAtom,
  searchQueryAtom,
  selectedTagIdsAtom,
  TagSelection,
} from "../../lib/jotai";
import { getFullNameOfUser } from "../../lib/user";
import { Button, Text } from "../atomic";
import { ProfileCard } from "../ProfileCard";

import { FilterBar } from "./FilterBar";

const todayDateString = format(addDays(new Date(), 4), "yyyy-MM-dd");

class SeededRNG {
  seed: number;
  constructor(seed = 123456789) {
    this.seed = seed;
  }

  nextFloat() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// Convert an array of strings to a number
function arrayToSeed(arr: string[]) {
  let hash = 0;
  const string = arr.join(",");
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function generateRandomVal(arr: string[]) {
  const seed = arrayToSeed(arr);
  const rng = new SeededRNG(seed);
  return rng.nextFloat();
}

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

export function SpaceLandingPage() {
  const { currentSpace } = useCurrentSpace();
  const { privacySettings } = usePrivacySettings();
  const { currentProfileHasRole, currentProfile } = useCurrentProfile();

  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);

  const spaceSlug = useQueryParam("slug", "string");

  const router = useRouter();

  const [selectedTagIds] = useAtom(selectedTagIdsAtom);
  const [searchQuery] = useAtom(searchQueryAtom);

  const selectedTagIdsSet = useMemo(() => {
    // Add all tags to the set
    const tagIds = new Set<string>();

    Object.values(selectedTagIds).forEach((tagSet) => {
      tagSet.forEach((tagId) => tagIds.add(tagId));
    });
    return tagIds;
  }, [selectedTagIds]);

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
          ...(Object.keys(selectedTagIds).length > 0
            ? {
                _and: Object.values(selectedTagIds)
                  .filter((set) => set.size > 0)
                  .map((categoryTagSet) => ({
                    _and: Array.from(categoryTagSet).map((tagId) => ({
                      profile_listing_to_space_tags: {
                        space_tag_id: { _eq: tagId },
                      },
                    })),
                  })),
              }
            : undefined),
        },
      },
    });

  const allProfileListings = useMemo(
    () => [...(profileListingData?.profile_listing ?? [])],
    [profileListingData?.profile_listing]
  );

  const filteredProfileListings = useMemo(() => {
    if (searchQuery === "")
      return shuffleProfiles(allProfileListings, getDayOfYear(new Date()));

    const searchQueryLower = searchQuery.toLowerCase();
    const fuse = new Fuse(allProfileListings, FUSE_OPTIONS);
    return fuse.search(searchQueryLower).map((result) => result.item);
  }, [allProfileListings, searchQuery]);

  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  // const idsToProfileScores = useMemo(() => {
  //   let tempCounter = 0;
  //   const tempIdsToProfileScores = new Map();

  //   for (let i = 0; i < filteredProfileListings.length; i++) {
  //     const profileListing =
  //       filteredProfileListings[i]?.profile?.profile_listing;

  //     if (profileListing && profileListing.profile_listing_responses) {
  //       for (
  //         let j = 0;
  //         j < profileListing.profile_listing_responses?.length;
  //         j++
  //       ) {
  //         const response = profileListing.profile_listing_responses[j];
  //         if (response && response.response_html) {
  //           const responseArray = response.response_html.split(" ");

  //           if (responseArray.length >= 10) {
  //             tempCounter += 4;
  //           } else if (responseArray.length >= 1) {
  //             tempCounter += 2;
  //           }
  //         }
  //       }
  //     }

  //     const profileHeadline = filteredProfileListings[i]?.headline;
  //     if (profileHeadline && profileHeadline.length > 0) {
  //       const headlineArray = profileHeadline.split(" ");

  //       if (headlineArray.length >= 3) {
  //         tempCounter += 5;
  //       } else if (headlineArray.length >= 1) {
  //         tempCounter += 3;
  //       }
  //     }

  //     if (filteredProfileListings[i].profile_listing_image != null) {
  //       tempCounter += 10;
  //     }

  //     tempCounter +=
  //       15 *
  //       generateRandomVal([
  //         todayDateString,
  //         filteredProfileListings[i]?.id ?? "",
  //       ]);
  //     tempIdsToProfileScores.set(filteredProfileListings[i].id, tempCounter);
  //     tempCounter = 0;
  //   }
  //   return tempIdsToProfileScores;
  // }, [filteredProfileListings]);

  // const sortedProfileListings = filteredProfileListings.sort((a, b) => {
  //   if (idsToProfileScores.get(a.id) > idsToProfileScores.get(b.id)) {
  //     return -1;
  //   } else {
  //     return 1;
  //   }
  // });
  const sortedProfileListings = filteredProfileListings;

  const [adminBypass, setAdminBypass] = useAtom(adminBypassAtom);

  return (
    <div>
      <FilterBar />
      <div className="h-8"></div>
      {fetchingProfileListings && profileListingData === undefined ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {new Array(8).fill(0).map((_, i) => (
            <div
              className="h-80 animate-pulse rounded-md bg-gray-100"
              key={i}
            ></div>
          ))}
        </div>
      ) : privacySettings?.allowOnlyPublicMembersToViewProfiles &&
        !currentProfile?.profile_listing?.public &&
        !adminBypass ? (
        <>
          <div className="flex flex-col items-center rounded-md bg-lime-300 p-6 text-center">
            <Text italic>
              Publish your profile so you can see other profiles!
            </Text>
            <div className="h-4"></div>
            <Link href={`/space/${spaceSlug}/account/profile`} passHref>
              <Button rounded>Go to My Profile</Button>
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-12 flex flex-col items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setAdminBypass(true);
                }}
              >
                Admin only: View profiles anyways
              </Button>
            </div>
          )}
        </>
      ) : allProfileListings.length === 0 ? (
        <div>
          <Text italic>No results found</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <DndContext
            collisionDetection={closestCenter}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={sortedProfileListings}
              strategy={rectSortingStrategy}
            >
              {sortedProfileListings.map((listing, idx) => {
                const fullName = getFullNameOfUser(listing.profile.user);

                const sortedTags = listing.profile_listing_to_space_tags
                  .map((tag) => tag.space_tag)
                  .sort((a, b) => {
                    const aSelected = selectedTagIdsSet.has(a.id);
                    const bSelected = selectedTagIdsSet.has(b.id);

                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0;
                  });

                const tagNames = sortedTags?.map((tag) => tag.label) ?? [];

                return (
                  <ProfileCard
                    key={listing.id}
                    id={listing.id}
                    onClick={() => {
                      router.push(
                        `${router.asPath}/profile/${listing.profile.id}`
                      );
                    }}
                    name={fullName}
                    imageUrl={listing.profile_listing_image?.image.url}
                    subtitle={listing.headline}
                    descriptionTitle={"Topics"}
                    tags={tagNames}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
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
