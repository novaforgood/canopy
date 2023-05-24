import { useMemo, useState } from "react";

import { closestCenter, DndContext, MeasuringStrategy } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { getDayOfYear } from "date-fns";
import Fuse from "fuse.js";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";

import { useProfileByIdQuery } from "../../generated/graphql";
import { useAllProfilesOfUserQuery } from "../../generated/graphql";
import { useUserData } from "../../hooks/useUserData";

import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrivacySettings } from "../../hooks/usePrivacySettings";
import { useQueryParam } from "../../hooks/useQueryParam";
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
import { boolean } from "zod";
import { GetProfileDocument } from "../../server/generated/serverGraphql";

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

  // loop through filteredProfileListings!
  
  // idToProfileScore (user's id : how "filled out" their profile is!)
  const ids = [];
  const profileScores = [];
  const idsToProfileScores = new Map();

  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });
  
  
  

  for(let i = 0; i < filteredProfileListings.length; i++){
    idsToProfileScores.set(filteredProfileListings[i].id, 0);
  }

  


  // const [
  //   { data: profileData, fetching: fetchingProfileData },
  //   refetchProfileById,
  // ] = useProfileByIdQuery({
  //   variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  // });

  {/* Find some way to sort filteredProfileListings here? That way, we can sort the profiles before we sort the tags of each profile? */}
  const sortedProfileListings = filteredProfileListings.sort((a, b) =>
    {
      // return -1 IF A should go before B
      // return 1 IF A should go after B
      // return 0 if NO PREFERENCE
      

      // make use of filteredProfileListings so we can sort by number of fields filled!?
      
      

      if(a.profile_listing_image != null && b.profile_listing_image != null){
        // refer to a's and b's headlines for next sort
      

        if(a.headline!.length < b.headline!.length){
       
          return 1;
        } else {
         
          return -1;
        }
        
      } else if(a.profile_listing_image != null){
       
        return -1;
      } else {
       
        return 1;
      }
     
    }
  )


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
              items={filteredProfileListings}
              strategy={rectSortingStrategy}
            >

              {filteredProfileListings.map((listing, idx) => {
                const fullName = getFullNameOfUser(listing.profile.user);

              
                
                // this sorts the tags for each user!
                const sortedTags = listing.profile_listing_to_space_tags
                  .map((tag) => tag.space_tag)
                  .sort((a, b) => {
                    const aSelected = selectedTagIdsSet.has(a.id);
                    const bSelected = selectedTagIdsSet.has(b.id);
                    
                    // const aHasResponses = selectedTagIdsSet.has(a.profileListingImage);
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