import React, { useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Tag,
  Space_Tag_Category,
  useSetProfileListingTagsMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { EditButton } from "../EditButton";
import { ActionModal } from "../modals/ActionModal";
import { Tag } from "../Tag";

type EditProfileTagsProps = {
  tagCategory: Omit<Space_Tag_Category, "space" | "space_tags"> & {
    space_tags: Omit<
      Space_Tag,
      "space_tag_category" | "space_tag_category_id"
    >[];
  };
};

export function EditProfileTags(props: EditProfileTagsProps) {
  const { tagCategory } = props;

  const { currentProfile } = useCurrentProfile();
  const [_, setProfileListingTags] = useSetProfileListingTagsMutation();

  const tagsOfUser = new Set(
    currentProfile?.profile_listing?.profile_listing_to_space_tags.map(
      (item) => item.space_tag_id
    ) ?? []
  );

  const [selectedTags, setSelectedTags] = useState<Set<string>>(tagsOfUser);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setSelectedTags(tagsOfUser);
    setIsOpen(true);
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={async () => {
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

          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Text variant="heading4">{tagCategory.title}</Text>
          <div className="h-4"></div>
          <div className="w-72">
            <SelectAutocomplete
              options={tagCategory.space_tags
                .filter((item) => item.deleted === false)

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
            {tagCategory.space_tags.map((tag) => {
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
      </ActionModal>
      <div className="flex flex-col items-start">
        <Text variant="subheading1">
          {tagCategory.title}
          <EditButton onClick={openModal} className="mb-1 ml-1" />
        </Text>

        <div className="h-2"></div>

        <div className="flex flex-wrap gap-2">
          {tagCategory.space_tags?.map((tag, index) =>
            selectedTags.has(tag.id) ? (
              <Tag key={index} text={tag.label ?? ""} />
            ) : null
          )}
        </div>

        <div className="h-2"></div>
      </div>
    </>
  );
}
