import React, { useMemo, useState } from "react";

import { Text } from "../../components/atomic";
import {
  useSpaceTagCategoriesQuery,
  useProfileListingToSpaceTagQuery,
  useSpaceTagsQuery,
} from "../../generated/graphql";
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
  const [{ data: spaceTagCategoriesData }] = useSpaceTagCategoriesQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const spaceCategories = useMemo(() => {
    return spaceTagCategoriesData?.space_tag_category ?? [];
  }, [spaceTagCategoriesData?.space_tag_category]);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  return (
    <StageDisplayWrapper
      title="Tags"
      onPrimaryAction={onComplete}
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
                    options={category.space_tags.map((tag) => ({
                      label: tag.label,
                      value: tag.id,
                    }))}
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
