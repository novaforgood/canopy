import React, { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import { Text } from "../../components/atomic";
import {
  useSpaceTagCategoriesQuery,
  useSetProfileListingTagsMutation,
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Tag_Constraint,
  Space_Tag_Update_Column,
  Space_Tag_Status_Enum,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { Tag } from "../common/Tag";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

type SelectedTag = {
  label: string;
  tagCategoryId: string;
  tagId: string | null;
};

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

  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);

  const initSpaceTags =
    currentProfile?.profile_listing?.profile_listing_to_space_tags;
  useEffect(() => {
    if (initSpaceTags) {
      setSelectedTags(
        initSpaceTags.map((tag) => ({
          label: tag.space_tag.label,
          tagCategoryId: tag.space_tag.space_tag_category_id,
          tagId: tag.space_tag_id,
        }))
      );
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
          inputs: selectedTags.map((tag) => ({
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
            space_tag_id: tag.tagId ?? undefined,
            space_tag: tag.tagId
              ? undefined
              : {
                  data: {
                    label: tag.label,
                    space_tag_category_id: tag.tagCategoryId,
                    status: Space_Tag_Status_Enum.Pending,
                  },
                  on_conflict: {
                    constraint:
                      Space_Tag_Constraint.SpaceTagLabelSpaceTagCategoryIdKey,
                    update_columns: [
                      Space_Tag_Update_Column.SpaceTagCategoryId,
                    ],
                  },
                },
          })),
        })
          .then((res) => {
            if (res.error) {
              console.log(res.error);
              throw new Error(res.error.message);
            } else {
              onComplete();
            }
          })
          .catch((error) => {
            toast.error("Error when saving tags: " + error.message);
          });
      }}
      onSecondaryAction={onSkip}
    >
      <div className="flex w-full flex-col items-start gap-16">
        <div className="h-8"></div>
        {spaceCategories.map((category) => {
          return (
            <div className="flex w-full flex-col items-start" key={category.id}>
              <Text variant="subheading2" className="font-bold text-gray-600">
                {category.title}
              </Text>
              <div className="h-2"></div>

              <div className="h-4"></div>
              <div className="flex flex-col gap-4 md:flex-row md:gap-16">
                <div className="w-72">
                  <SelectAutocomplete
                    placeholder={
                      category.rigid_select
                        ? "Select tag…"
                        : "Select tag, or type to suggest…"
                    }
                    options={category.space_tags
                      .map((tag) => ({
                        label: tag.label,
                        value: tag.id,
                      }))
                      .filter((tag) => {
                        return !selectedTags.some(
                          (selectedTag) =>
                            selectedTag.label === tag.label &&
                            selectedTag.tagCategoryId === category.id
                        );
                      })}
                    value={null}
                    onSelect={(value, label) => {
                      if (!value || !label) return;
                      setSelectedTags((prev) => {
                        if (
                          category.space_tags.some(
                            (tag) =>
                              tag.label === label &&
                              tag.status === Space_Tag_Status_Enum.Deleted
                          )
                        ) {
                          toast.error("This tag has been deleted");
                          return prev;
                        }
                        return [
                          ...prev,
                          {
                            label: label,
                            tagCategoryId: category.id,
                            tagId: value,
                          },
                        ];
                      });
                    }}
                    onExtraOptionSelect={(newInput) => {
                      const tagExists = category.space_tags.find(
                        (tag) => tag.label === newInput
                      );
                      const tagSelected = selectedTags.find(
                        (tag) => tag.label === newInput
                      );
                      if (tagExists || tagSelected) {
                        if (
                          tagExists?.status === Space_Tag_Status_Enum.Deleted
                        ) {
                          toast.error("This tag has been banned by the admin.");
                        } else {
                          toast.error("Cannot add duplicate tag");
                        }
                        return;
                      }

                      setSelectedTags((prev) => {
                        return [
                          ...prev,
                          {
                            label: newInput,
                            tagCategoryId: category.id,
                            tagId: null,
                          },
                        ];
                      });
                    }}
                    renderExtraOption={
                      category.rigid_select
                        ? undefined
                        : (value) => {
                            return (
                              <span>
                                Create tag:{" "}
                                <Text variant="body2" bold>
                                  {value}
                                </Text>
                              </span>
                            );
                          }
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2 py-3">
                  {selectedTags.map((tag) => {
                    if (tag.tagCategoryId !== category.id) return null;
                    return (
                      <Tag
                        key={tag.label}
                        text={tag.label}
                        onDeleteClick={() => {
                          setSelectedTags((prev) => {
                            return prev.filter((t) => t.label !== tag.label);
                          });
                        }}
                      ></Tag>
                    );
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
