import { useCallback, useMemo } from "react";

import { useAtom } from "jotai";

import { BxSearch } from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { searchQueryAtom, selectedTagIdsAtom } from "../../lib/jotai";
import { isTagOfficial } from "../../lib/tags";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { Tag } from "../common/Tag";
import { TextInput } from "../inputs/TextInput";

export function FilterBar() {
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
