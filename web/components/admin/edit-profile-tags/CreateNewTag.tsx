import { useCallback, useState } from "react";

import toast from "react-hot-toast";

import { Space_Tag_Status_Enum } from "../../../generated/graphql";
import { BxTrash, BxTrashAlt } from "../../../generated/icons/regular";
import { BxsTrash } from "../../../generated/icons/solid";
import { getTempId } from "../../../lib/tempId";
import { NewSpaceTag, NewTagCategory } from "../../../lib/types";
import { Button, Text } from "../../atomic";
import { TextInput } from "../../inputs/TextInput";

interface CreateNewTagProps {
  tagCategory: NewTagCategory;
  onChange: (newTagCategory: NewTagCategory) => void;
}

export function CreateNewTag(props: CreateNewTagProps) {
  const { tagCategory, onChange } = props;
  const [newTag, setNewTag] = useState("");
  const addTag = useCallback(() => {
    if (newTag.length === 0) {
      return;
    }

    const currentTags: NewSpaceTag[] = tagCategory.space_tags?.data ?? [];

    const existingTag = currentTags.find((tag) => tag.label === newTag);
    if (existingTag) {
      if (existingTag.status === Space_Tag_Status_Enum.Deleted) {
        onChange({
          ...tagCategory,
          space_tags: {
            data: [
              ...currentTags.filter((tag) => tag.label !== newTag),
              { ...existingTag, status: Space_Tag_Status_Enum.Accepted },
            ],
          },
        });
        setNewTag("");
      } else {
        toast.error(`Tag ${newTag} already exists`);
        return;
      }
    } else {
      onChange({
        ...tagCategory,
        space_tags: {
          data: [
            ...currentTags,
            {
              label: newTag,
              status: Space_Tag_Status_Enum.Accepted,
              id: getTempId(),
            },
          ],
        },
      });
      setNewTag("");
    }
  }, [newTag, tagCategory, onChange]);

  return (
    <div className="">
      <div className="h-4"></div>
      <Text className="text-gray-600" variant="body2">
        Type and hit “enter” to add a tag to the official list. Click the{" "}
        <BxsTrash className="inline h-4 w-4" /> in Official Directory tags to
        remove.
      </Text>
      <div className="h-2"></div>
      <div className="flex w-96 items-center gap-2">
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
          className="shrink-0 px-2"
          disabled={newTag.length === 0}
          onClick={addTag}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
