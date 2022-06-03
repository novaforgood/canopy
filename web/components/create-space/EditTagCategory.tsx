import React, { useEffect, useState } from "react";

import { Space_Tag_Category_Insert_Input } from "../../generated/graphql";
import { BxX } from "../../generated/icons/regular";
import { Input, Text } from "../atomic";
import { DeleteButton } from "../DeleteButton";
import { EditButton } from "../EditButton";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

const LOREM_IPSUM_PREFIX =
  "Your community members will write their responses here. ";
const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non tellus orci ac auctor augue mauris augue neque gravida. Quis blandit turpis cursus in hac habitasse platea. Aliquet lectus proin nibh nisl condimentum. Iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Lectus mauris ultrices eros in cursus turpis massa. Dui id ornare arcu odio ut sem nulla. Egestas diam in arcu cursus euismod quis viverra nibh. Sit amet cursus sit amet dictum sit amet justo donec. In eu mi bibendum neque egestas congue quisque. Fermentum dui faucibus in ornare quam viverra orci sagittis. Orci a scelerisque purus semper eget duis at tellus at. Adipiscing enim eu turpis egestas pretium aenean. Tempus quam pellentesque nec nam aliquam sem. Pretium lectus quam id leo in vitae. Sed faucibus turpis in eu mi bibendum. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae. ";
const LOREM_IPSUM_REPEATED = LOREM_IPSUM.repeat(10);

interface TagProps {
  text: string;
  onDeleteClick?: () => void;
}
function Tag(props: TagProps) {
  const { text, onDeleteClick } = props;

  return (
    <div className="rounded-full bg-gray-200 flex items-center px-5 py-1">
      <div
        className="whitespace-nowrap text-sm text-gray-800"
        style={{ fontWeight: 500 }}
      >
        {text}
      </div>
      {onDeleteClick && (
        <BxX
          className="w-5 h-5 ml-2 -mr-1 cursor-pointer text-black hover:text-gray-600"
          onClick={onDeleteClick}
        />
      )}
    </div>
  );
}

type EditTagCategoryProps = {
  tagCategory: Space_Tag_Category_Insert_Input;
  onSave?: (tagCategory: Space_Tag_Category_Insert_Input) => void;
  onDelete?: () => void;
};

export function EditTagCategory(props: EditTagCategoryProps) {
  const { tagCategory, onSave = () => {}, onDelete = () => {} } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState(tagCategory.title ?? "");
  const [tags, setTags] = useState(tagCategory.space_tags?.data ?? []);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(tagCategory.title ?? "");
      setTags(tagCategory.space_tags?.data ?? []);
      setNewTag("");
    }
  }, [isOpen, tagCategory.space_tags, tagCategory.title]);

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={() => {
          onSave({
            ...tagCategory,
            title,
            space_tags: {
              data: tags,
            },
          });
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Text variant="heading4" className="text-center">
            Edit tag category
          </Text>
          <div className="h-8"></div>
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mb-4"
          />
          <div className="h-8"></div>
          <Text className="text-gray-700">
            Type and hit [enter] to create a tag.
          </Text>
          <div className="h-2"></div>
          <TextInput
            value={newTag}
            onValueChange={setNewTag}
            placeholder="Add tags"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (newTag.length > 0) {
                  setTags((prev) => [...prev, { label: newTag }]);
                  setNewTag("");
                }
              }
            }}
          />
          <div className="h-4"></div>
          <div className="flex flex-wrap items-start gap-2">
            {tags.map((tag, index) => (
              <Tag
                key={index}
                text={tag.label ?? ""}
                onDeleteClick={() => {
                  setTags((prev) => prev.filter((t, i) => i !== index));
                }}
              />
            ))}
          </div>
        </div>
      </ActionModal>
      <div className="flex flex-col pb-16">
        <Text variant="subheading1">
          {tagCategory.title}
          <EditButton
            className="mb-1 ml-1"
            onClick={() => {
              setIsOpen(true);
            }}
          />
          <DeleteButton className="mb-1 ml-1" onClick={onDelete} />
        </Text>
        <div className="h-2"></div>
        <div className="flex flex-wrap items-start gap-2">
          {tagCategory.space_tags?.data.map((tag, index) => (
            <Tag key={index} text={tag.label ?? ""} />
          ))}
        </div>
      </div>
    </>
  );
}
