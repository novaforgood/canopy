import React, { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  Space_Tag_Category_Insert_Input,
  Space_Tag_Insert_Input,
} from "../../generated/graphql";
import { Button, Input, Text } from "../atomic";
import { DeleteButton } from "../DeleteButton";
import { EditButton } from "../EditButton";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";
import { Tag } from "../Tag";

type EditTagCategoryProps = {
  tagCategory: Space_Tag_Category_Insert_Input;
  onSave?: (tagCategory: Space_Tag_Category_Insert_Input) => void;
  onDelete?: () => void;
};

export function EditTagCategory(props: EditTagCategoryProps) {
  const { tagCategory, onSave = () => {}, onDelete = () => {} } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState(tagCategory.title ?? "");
  const [tags, setTags] = useState<Space_Tag_Insert_Input[]>(
    tagCategory.space_tags?.data ?? []
  );
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(tagCategory.title ?? "");
      setTags(tagCategory.space_tags?.data ?? []);
      setNewTag("");
    }
  }, [isOpen, tagCategory.space_tags, tagCategory.title]);

  const addTag = () => {
    if (newTag.length === 0) {
      return;
    }
    if (tags.map((t) => t.label).includes(newTag)) {
      toast.error(`Tag "${newTag}" already exists`);
      return;
    }
    setTags((prev) => [...prev, { label: newTag, deleted: false }]);
    setNewTag("");
  };

  const onClose = () => {
    setIsOpen(false);
    onSave({
      ...tagCategory,
      title,
      space_tags: {
        data: tags,
      },
    });
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={onClose}
        actionText="Done editing"
        onAction={onClose}
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
            Type and hit <Text bold>[enter]</Text> to create a tag.
          </Text>
          <div className="h-2"></div>
          <div className="flex items-center gap-2">
            <TextInput
              value={newTag}
              onValueChange={setNewTag}
              placeholder="Add tags"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  addTag();
                }
              }}
            />
            <Button
              size="small"
              variant="outline"
              className="px-2 shrink-0"
              disabled={newTag.length === 0}
              onClick={addTag}
            >
              Add
            </Button>
          </div>

          <div className="h-4"></div>
          <div className="flex flex-wrap items-start gap-2">
            {tags
              .filter((tag) => !tag.deleted)
              .map((tag, index) => (
                <Tag
                  key={index}
                  text={tag.label ?? ""}
                  onDeleteClick={() => {
                    setTags((prev) => {
                      return prev
                        .map((t) => {
                          if (!t.id) {
                            if (t.label === tag.label) {
                              return null;
                            } else {
                              return t;
                            }
                          } else if (t.id === tag.id) {
                            return { ...t, deleted: true };
                          } else {
                            return t;
                          }
                        })
                        .filter((v) => v !== null) as Space_Tag_Insert_Input[];
                    });
                  }}
                />
              ))}
          </div>
        </div>
      </ActionModal>
      <div className="flex flex-col">
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
          {tagCategory.space_tags?.data
            .filter((tag) => !tag.deleted)
            .map((tag, index) => (
              <Tag key={index} text={tag.label ?? ""} />
            ))}
        </div>
      </div>
    </>
  );
}
