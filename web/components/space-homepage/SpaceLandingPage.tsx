import { createFactory, Fragment, ImgHTMLAttributes, useState } from "react";

import { useRouter } from "next/router";

import {
  Profile_Role_Enum,
  useProfileListingsInSpaceQuery,
} from "../../generated/graphql";
import { BxFilter } from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useUserData } from "../../hooks/useUserData";
import { Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { HtmlDisplay } from "../HtmlDisplay";
import { ProfileCard } from "../ProfileCard";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";
import { Tag } from "../Tag";

import { SearchBar } from "./SearchBar";

function SpaceSplashPage() {
  const { currentSpace } = useCurrentSpace();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
      <div className="flex-col flex-1 hidden sm:flex">
        <Text variant="heading1">{currentSpace?.name}</Text>
        <div className="h-8"></div>
        <HtmlDisplay html={currentSpace?.description_html ?? ""} />
      </div>
      <div className="flex-1 self-stretch -mx-6 sm:mx-0">
        <SpaceCoverPhoto
          className="h-full w-full bg-gray-50"
          src={currentSpace?.space_cover_image?.image.url}
        ></SpaceCoverPhoto>
      </div>
      <div className="flex-col flex-1 flex sm:hidden">
        <Text variant="heading3">{currentSpace?.name}</Text>
        <div className="h-2"></div>
        <HtmlDisplay html={currentSpace?.description_html ?? ""} />
      </div>
    </div>
  );
}

interface FilterBarProps {
  selectedTagIds: Set<string>;
  onChange: (newTagIds: Set<string>) => void;
}
function FilterBar(props: FilterBarProps) {
  const { selectedTagIds, onChange } = props;

  const { currentSpace } = useCurrentSpace();

  return (
    <div>
      <div className="flex items-center gap-4">
        <Text>Filter by:</Text>
        {currentSpace?.space_tag_categories
          .filter((category) => !category.deleted)
          .map((category) => {
            return (
              <div className="w-64" key={category.id}>
                <SelectAutocomplete
                  key={category.id}
                  placeholder={category.title}
                  options={category.space_tags
                    .filter((category) => !category.deleted)
                    .map((tag) => ({
                      value: tag.id,
                      label: tag.label,
                    }))}
                  value={null}
                  onSelect={(newTagId) => {
                    if (newTagId)
                      onChange(
                        new Set([...Array.from(selectedTagIds), newTagId])
                      );
                  }}
                />
              </div>
            );
          })}
      </div>
      <div className="h-4"></div>
      <div className="flex gap-2">
        {currentSpace?.space_tag_categories.map((category) => {
          return (
            <Fragment key={category.id}>
              {category.space_tags.map((tag) =>
                selectedTagIds.has(tag.id) ? (
                  <Tag
                    text={tag.label}
                    key={tag.id}
                    onDeleteClick={() => {
                      onChange(
                        new Set(
                          Array.from(selectedTagIds).filter(
                            (id) => id !== tag.id
                          )
                        )
                      );
                    }}
                  />
                ) : null
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function SpaceLandingPage() {
  const { currentSpace } = useCurrentSpace();

  const router = useRouter();

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const [{ data: profileListingData, fetching: fetchingProfileListings }] =
    useProfileListingsInSpaceQuery({
      variables: {
        where: {
          profile: {
            space_id: { _eq: currentSpace?.id },
            flattened_profile_roles: {
              profile_role: { _eq: Profile_Role_Enum.MemberWhoCanList },
            },
          },
          public: { _eq: true },

          profile_listing_to_space_tags:
            selectedTagIds.size > 0
              ? {
                  space_tag: {
                    id: {
                      _in: Array.from(selectedTagIds),
                    },
                  },
                }
              : undefined,
        },
      },
    });

  const allProfileListings = profileListingData?.profile_listing ?? [];

  return (
    <div>
      <div className="h-16"></div>
      <SpaceSplashPage />
      <div className="h-16"></div>
      <FilterBar selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
      <div className="h-8"></div>
      {fetchingProfileListings && (
        <div>
          <Text italic>Loading...</Text>
        </div>
      )}
      {allProfileListings.length === 0 && (
        <div>
          <Text italic>No profiles found</Text>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {allProfileListings.map((listing, idx) => {
          const { first_name, last_name } = listing.profile.user;

          const tagNames =
            listing.profile_listing_to_space_tags?.map(
              (tag) => tag.space_tag.label
            ) ?? [];
          return (
            <ProfileCard
              key={idx}
              onClick={() => {
                router.push(`${router.asPath}/profile/${listing.profile.id}`);
              }}
              name={`${first_name} ${last_name}`}
              imageUrl={listing.profile_listing_image?.image.url}
              subtitle={listing.headline}
              descriptionTitle={"Tags"}
              description={tagNames.length === 0 ? "none" : tagNames.join(", ")}
            />
          );
        })}
      </div>
    </div>
  );
}
