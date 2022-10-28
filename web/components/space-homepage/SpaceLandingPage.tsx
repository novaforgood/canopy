import { useCallback, useMemo, useState } from "react";

import { closestCenter, DndContext, MeasuringStrategy } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { getDayOfYear } from "date-fns";
import Fuse from "fuse.js";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { BxSearch } from "../../generated/icons/regular";
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
import { isTagOfficial } from "../../lib/tags";
import { Button, Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { TextInput } from "../inputs/TextInput";
import { ProfileCard } from "../ProfileCard";
import { Tag } from "../Tag";

import { shuffleProfiles } from "./ShuffleProfiles";

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

function FilterBar() {
  const { currentSpace } = useCurrentSpace();

  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const tagCategories = useMemo(
    () =>
      currentSpace?.space_tag_categories.filter(
        (category) => !category.deleted
      ) ?? [],
    [currentSpace?.space_tag_categories]
  );

  const tagAdded = useCallback(
    (categoryId: string, tagId: string) => {
      const updatedCategory = new Set([
        ...Array.from(selectedTagIds[categoryId] ?? []),
        tagId,
      ]);
      return { ...selectedTagIds, [categoryId]: updatedCategory };
    },
    [selectedTagIds]
  );

  const tagRemoved = useCallback(
    (categoryId: string, tagId: string) => {
      const updatedCategory = new Set(
        Array.from(selectedTagIds[categoryId] ?? []).filter(
          (id) => id !== tagId
        )
      );
      return { ...selectedTagIds, [categoryId]: updatedCategory };
    },
    [selectedTagIds]
  );

  return (
    <div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:gap-4">
        <div className="w-64">
          <TextInput
            renderPrefix={() => (
              <BxSearch className="mr-1 h-5 w-5 text-gray-900" />
            )}
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {tagCategories.map((category) => {
          return (
            <div className="w-64" key={category.id}>
              <SelectAutocomplete
                key={category.id}
                placeholder={category.title}
                options={category.space_tags
                  .filter((tag) => isTagOfficial(tag))
                  .filter(
                    (t) => !(selectedTagIds[category.id]?.has(t.id) ?? false)
                  )
                  .map((tag) => ({
                    value: tag.id,
                    label: tag.label,
                  }))}
                value={null}
                onSelect={(newTagId) => {
                  if (newTagId)
                    setSelectedTagIds(tagAdded(category.id, newTagId));
                  // onChange(
                  //   new Set([...Array.from(selectedTagIds), newTagId])
                  // );
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="h-4"></div>
      <div className="flex flex-wrap gap-2">
        {currentSpace?.space_tag_categories.map((category) => {
          const selectedTags = category.space_tags.filter(
            (t) => selectedTagIds[category.id]?.has(t.id) ?? false
          );

          if (selectedTags.length === 0) return null;
          return (
            <div key={category.id} className="mr-4 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Tag
                  text={tag.label}
                  key={tag.id}
                  onDeleteClick={() => {
                    setSelectedTagIds(tagRemoved(category.id, tag.id));
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
                const { first_name, last_name } = listing.profile.user;

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
                    name={`${first_name} ${last_name}`}
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
