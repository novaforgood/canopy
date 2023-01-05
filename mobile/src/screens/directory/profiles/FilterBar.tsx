import { useCallback, useMemo } from "react";

import { useAtom } from "jotai";

import { Box } from "../../../components/atomic/Box";
import { SelectAutocomplete } from "../../../components/atomic/SelectAutocomplete";
import { TextInput } from "../../../components/atomic/TextInput";
import { Tag } from "../../../components/Tag";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { selectedTagIdsAtom, searchQueryAtom } from "../../../lib/jotai";

import { isTagOfficial } from "./tags";

export function FilterBar() {
  const { currentSpace } = useCurrentSpace();

  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const tagCategories = useMemo(
    () =>
      currentSpace?.space_tag_categories?.filter(
        (category) => !category.deleted
      ) ?? [],
    [currentSpace?.space_tag_categories]
  );

  // Flatten tag categories into a single array of tags for the search bar
  const allTags = useMemo(
    () =>
      tagCategories
        .flatMap((category) => category.space_tags)
        .filter((tag) => isTagOfficial(tag))
        .filter((tag) => !selectedTagIds.has(tag.id))
        .map((tag) => ({
          value: tag.id,
          label: tag.label,
        })),
    [tagCategories, selectedTagIds]
  );

  return (
    <Box zIndex={1}>
      <TextInput
        mt={2}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search text…"
        width="100%"
      />

      <Box
        flexDirection="row"
        width="100%"
        flexWrap="wrap"
        alignItems="center"
        mt={2}
        zIndex={1}
      >
        <SelectAutocomplete
          placeholder="Filter by tags…"
          options={allTags}
          value={null}
          onSelect={(newTagId) => {
            if (!newTagId) return;

            setSelectedTagIds((prev) => {
              return new Set([...Array.from(prev), newTagId]);
            });
          }}
        />
      </Box>
      <Box flexDirection="row" flexWrap="wrap" mt={2}>
        {currentSpace?.space_tag_categories?.map((category) => {
          const selectedTags = category.space_tags.filter(
            (t) => selectedTagIds.has(t.id) ?? false
          );

          if (selectedTags.length === 0) return null;
          return (
            <Box key={category.id} flexDirection="row" flexWrap="wrap" mr={4}>
              {selectedTags.map((tag) => (
                <Box ml={1} mt={1}>
                  <Tag
                    size="md"
                    text={tag.label}
                    key={tag.id}
                    onDeleteClick={() => {
                      setSelectedTagIds((prev) => {
                        prev.delete(tag.id);
                        return new Set(prev);
                      });
                    }}
                  />
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
