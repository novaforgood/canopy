import React, { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import { Text } from "../../components/atomic";
import {
  useSpaceTagCategoriesQuery,
  useProfileListingToSpaceTagQuery,
  useSpaceTagsQuery,
  useSetProfileListingTagsMutation,
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { Tag } from "../Tag";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

export interface EnterTagsProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterTags(props: EnterTagsProps) {
  const { onComplete, onSkip } = props;

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data: spaceTagCategoriesData }] = useSpaceTagCategoriesQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const spaceCategories = useMemo(() => {
    return spaceTagCategoriesData?.space_tag_category ?? [];
  }, [spaceTagCategoriesData?.space_tag_category]);

  const [_, setProfileListingTags] = useSetProfileListingTagsMutation();

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const initSpaceTags =
    currentProfile?.profile_listing?.profile_listing_to_space_tags;
  useEffect(() => {
    if (initSpaceTags) {
      setSelectedTags(new Set(initSpaceTags.map((item) => item.space_tag_id)));
    }
  }, [initSpaceTags]);

  return (
    <StageDisplayWrapper
      title="Tags"
      onPrimaryAction={async () => {
        if (!currentProfile) {
          toast.error("No current profile");
          return;
        }
        await setProfileListingTags({
          profile_id: currentProfile.id,
          inputs: Array.from(selectedTags).map((tagId) => ({
            space_tag_id: tagId,
            profile_listing: {
              data: {
                profile_id: currentProfile.id,
              },
              on_conflict: {
                constraint:
                  Profile_Listing_Constraint.ProfileListingProfileIdKey,
                update_columns: [Profile_Listing_Update_Column.ProfileId],
              },
            },
          })),
        });
        onComplete();
      }}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start gap-16">
        <div className="h-8"></div>
        {spaceCategories.map((category) => {
          return (
            <div className="flex flex-col items-start" key={category.id}>
              <Text variant="subheading2" className="text-gray-600 font-bold">
                {category.title}
              </Text>
              <div className="h-4"></div>
              <div className="flex items-center gap-16">
                <div className="w-72">
                  <SelectAutocomplete
                    options={category.space_tags
                      .map((tag) => ({
                        label: tag.label,
                        value: tag.id,
                      }))
                      .filter((tag) => !selectedTags.has(tag.value))}
                    value={null}
                    onSelect={(value) => {
                      if (!value) return;
                      setSelectedTags((prev) => {
                        return new Set([...Array.from(prev), value]);
                      });
                    }}
                  />
                </div>

                <div className="flex gap-2 py-3">
                  {category.space_tags.map((tag) => {
                    const selected = selectedTags.has(tag.id);

                    return selected ? (
                      <Tag
                        key={tag.id}
                        text={tag.label}
                        onDeleteClick={() => {
                          setSelectedTags((prev) => {
                            const newSet = new Set(Array.from(prev));
                            newSet.delete(tag.id);
                            return newSet;
                          });
                        }}
                      ></Tag>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StageDisplayWrapper>
  );
}
