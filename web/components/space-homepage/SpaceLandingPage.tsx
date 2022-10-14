import {
  createFactory,
  Fragment,
  ImgHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { closestCenter, DndContext, MeasuringStrategy } from "@dnd-kit/core";
import {
  rectSortingStrategy,
  rectSwappingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { getDayOfYear } from "date-fns";
import { useAtom } from "jotai";
import { useRouter } from "next/router";

import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { BxFilter, BxSearch } from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrevious } from "../../hooks/usePrevious";
import { useQueryParam } from "../../hooks/useQueryParam";
import { useUserData } from "../../hooks/useUserData";
import {
  searchQueryAtom,
  selectedTagIdsAtom,
  TagSelection,
} from "../../lib/jotai";
import { isTagOfficial } from "../../lib/tags";
import { Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { TextInput } from "../inputs/TextInput";
import { ProfileCard } from "../ProfileCard";
import { Tag } from "../Tag";

import { shuffleProfiles } from "./ShuffleProfiles";

interface FilterBarProps {
  selectedTagIds: TagSelection;
  onChange: (newTagIds: TagSelection) => void;
  // selectedTagIds: Set<string>;
  // onChange: (newTagIds: Set<string>) => void;
}
function FilterBar(props: FilterBarProps) {
  const { selectedTagIds, onChange } = props;

  const { currentSpace } = useCurrentSpace();

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

  if (tagCategories.length === 0) {
    return <div className="h-12" />;
  }

  return (
    <div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:gap-4">
        <Text>Filter by:</Text>
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
                  if (newTagId) onChange(tagAdded(category.id, newTagId));
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
                    onChange(tagRemoved(category.id, tag.id));
                    // onChange(
                    //   new Set(
                    //     Array.from(selectedTagIds).filter(
                    //       (id) => id !== tag.id
                    //     )
                    //   )
                    // );
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

  const router = useRouter();

  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

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

  const shuffledProfileListings = useMemo(
    () => shuffleProfiles(allProfileListings, getDayOfYear(new Date())),
    [allProfileListings]
  );

  return (
    <div>
      <TextInput
        renderPrefix={() => <BxSearch className="mr-1 h-5 w-5 text-gray-700" />}
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <FilterBar selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
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
      ) : allProfileListings.length === 0 ? (
        <div>
          <Text italic>No profiles found</Text>
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
              items={shuffledProfileListings}
              strategy={rectSortingStrategy}
            >
              {shuffledProfileListings.map((listing, idx) => {
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
