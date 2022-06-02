import React, { useMemo, useState } from "react";

import { Text } from "../../components/atomic";
import Tag from "../../components/atomic/Tag";

import { StageDisplayWrapper } from "./StageDisplayWrapper";
import {
  useSpaceTagCategoriesQuery,
  useProfileListingToSpaceTagQuery,
  useSpaceTagsQuery,
} from "../../generated/graphql";

import { useCurrentSpace } from "../../hooks/useCurrentSpace";

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

  const selectedTags = new Set();
  const [selectedTagsState, setSelectedTags] = useState(selectedTags);

  return (
    <StageDisplayWrapper
      title="Tags"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex flex-col items-start">
              {spaceCategories.map((category) => {
                return (
                  <div
                    className="flex flex-col items-start mt- w-160"
                    key={category.id}
                  >
                    <Text
                      variant="subheading2"
                      className="text-gray-600 font-bold"
                    >
                      {category.title}
                    </Text>
                    <div className="flex gap-2 py-3">
                      {category.space_tags.map((tag) => {
                        const tagIsSelected = selectedTagsState.has(tag.label);
                        return (
                          <Tag
                            key={tag.id}
                            className="shadow-md"
                            variant={tagIsSelected ? "dark" : "outline"}
                            onClick={() => {
                              if (tagIsSelected) {
                                const removeTag = () => {
                                  setSelectedTags(
                                    (prev) =>
                                      new Set(
                                        [...selectedTagsState].filter(
                                          (x) => x !== tag.label
                                        )
                                      )
                                  );
                                };
                                removeTag();
                              } else {
                                const addTags = () => {
                                  setSelectedTags(
                                    (previousState) =>
                                      new Set([...selectedTagsState, tag.label])
                                  );
                                };
                                addTags();
                              }
                            }}
                          >
                            <span>{tag.label}</span>
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StageDisplayWrapper>
  );
}
