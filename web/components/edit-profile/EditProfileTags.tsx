import React, { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Tag,
  Space_Tag_Category,
  Space_Tag_Constraint,
  Space_Tag_Status_Enum,
  Space_Tag_Update_Column,
  useProfileListingQuery,
  useSetProfileListingTagsMutation,
  useSpaceTagCategoriesQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { showTagOnProfile } from "../../lib/tags";
import { Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { EditButton } from "../common/EditButton";
import { Tag } from "../common/Tag";
import { ActionModal } from "../modals/ActionModal";

type SelectedTag = {
  label: string;
  tagCategoryId: string;
  tagId: string | null;
};

type EditProfileTagsProps = {
  tagCategoryId: string;
  profileListingId: string;
};

export function EditProfileTags(props: EditProfileTagsProps) {
  const { tagCategoryId, profileListingId } = props;

  const { currentProfile, refetchCurrentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [_, setProfileListingTags] = useSetProfileListingTagsMutation();

  const [{ data: spaceTagCategoriesData }] = useSpaceTagCategoriesQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const tagCategory = spaceTagCategoriesData?.space_tag_category.find(
    (category) => category.id === tagCategoryId
  );

  const tagsOfUser: SelectedTag[] = useMemo(
    () =>
      currentProfile?.profile_listing?.profile_listing_to_space_tags.map(
        (item) => ({
          label: item.space_tag.label,
          tagCategoryId: item.space_tag.space_tag_category_id,
          tagId: item.space_tag_id,
        })
      ) ?? [],
    [currentProfile?.profile_listing?.profile_listing_to_space_tags]
  );

  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>(tagsOfUser);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setSelectedTags(tagsOfUser);
    setIsOpen(true);
  };

  const closeModalAndReset = () => {
    setIsOpen(false);
    setSelectedTags(tagsOfUser);
  };

  useEffect(() => {
    setSelectedTags(tagsOfUser);
  }, [tagsOfUser]);

  if (!tagCategory) {
    return null;
  }

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={closeModalAndReset}
        actionText="Save"
        onAction={async () => {
          if (!currentProfile) {
            toast.error("No current profile");
            return;
          }
          await setProfileListingTags({
            profile_id: currentProfile.id,
            inputs: Array.from(selectedTags).map((tag) => ({
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
                throw new Error(res.error.message);
              } else {
                toast.success("Tags saved");
                refetchCurrentProfile();
                setIsOpen(false);
              }
            })
            .catch((error) => {
              toast.error("Error when saving tags: " + error.message);
            });
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={closeModalAndReset}
      >
        <div className="flex w-96 flex-col p-8 py-16">
          <Text variant="heading4">{tagCategory.title}</Text>
          <div className="h-4"></div>
          <div className="w-72">
            <SelectAutocomplete
              placeholder={
                tagCategory.rigid_select
                  ? "Select tag…"
                  : "Select tag, or type to suggest…"
              }
              options={tagCategory.space_tags
                .filter((item) => showTagOnProfile(item, tagCategory))
                .map((tag) => ({
                  label: tag.label,
                  value: tag.id,
                }))
                .filter((tag) => {
                  return !selectedTags.some(
                    (selectedTag) =>
                      selectedTag.label === tag.label &&
                      selectedTag.tagCategoryId === tagCategory.id
                  );
                })}
              value={null}
              onSelect={(value, label) => {
                if (!value || !label) return;
                setSelectedTags((prev) => {
                  if (
                    tagCategory.space_tags.some(
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
                      tagCategoryId: tagCategory.id,
                      tagId: value,
                    },
                  ];
                });
              }}
              onExtraOptionSelect={(newInput) => {
                const tagExists = tagCategory.space_tags.find(
                  (tag) => tag.label === newInput
                );
                const tagSelected = selectedTags.find(
                  (tag) => tag.label === newInput
                );
                if (tagExists || tagSelected) {
                  if (tagExists?.status === Space_Tag_Status_Enum.Deleted) {
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
                      tagCategoryId: tagCategory.id,
                      tagId: null,
                    },
                  ];
                });
              }}
              renderExtraOption={
                tagCategory.rigid_select
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
              if (tag.tagCategoryId !== tagCategory.id) return null;
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
      </ActionModal>
      <div className="flex flex-col items-start">
        <Text variant="subheading1">
          {tagCategory.title}
          <EditButton onClick={openModal} className="mb-1 ml-1" />
        </Text>

        <div className="h-2"></div>

        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => {
            if (tag.tagCategoryId !== tagCategory.id) return null;
            return <Tag key={tag.tagId} text={tag.label ?? ""} />;
          })}
        </div>

        <div className="h-2"></div>
      </div>
    </>
  );
}
