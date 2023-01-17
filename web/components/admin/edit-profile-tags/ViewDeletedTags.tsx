import { useMemo } from "react";

import {
  Space_Tag_Status_Enum,
  useTagCountsQuery,
} from "../../../generated/graphql";
import { NewTagCategory } from "../../../lib/types";
import { Text } from "../../atomic";

import { DeletedTagItem } from "./DeletedTagItem";

interface ViewDeletedTagsProps {
  tagCategory: NewTagCategory;
  onChange: (newTagCategory: NewTagCategory) => void;
}

export function ViewDeletedTags(props: ViewDeletedTagsProps) {
  const { tagCategory, onChange } = props;

  const [{ data: tagCountsData }] = useTagCountsQuery({
    variables: {
      space_tag_category_id: tagCategory.id,
    },
  });

  // Map space tag ID to count
  const tagCountsMap = useMemo(
    () =>
      tagCountsData?.space_tag_category_by_pk?.space_tags.reduce(
        (acc, item) => {
          acc[item.id] =
            item.profile_listing_to_space_tags_aggregate.aggregate?.count ?? 0;
          return acc;
        },
        {} as Record<string, number>
      ),
    [tagCountsData?.space_tag_category_by_pk?.space_tags]
  );

  return (
    <div className="w-full">
      <div className="h-4"></div>
      <Text className="text-gray-600" variant="body2">
        You marked the following tags as banned. They will not appear in member
        profiles or directory filters. Click {'"Restore'} to make the tag
        official again.
      </Text>
      <div className="h-6"></div>
      <div className="flex select-none items-center gap-3 pl-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
          <Text variant="body3" bold>
            #
          </Text>
        </div>
        <Text variant="body2" className="text-gray-600" italic>
          number of members with this tag
        </Text>
      </div>
      <div className="h-4"></div>
      <div className="flex max-h-96 flex-col gap-1.5 overflow-y-scroll overscroll-contain pr-3">
        {tagCategory.space_tags?.data
          .filter((tag) => tag.status === Space_Tag_Status_Enum.Deleted)
          .map((tag) => (
            <DeletedTagItem
              key={tag.id}
              tag={tag}
              onRestore={() => {
                onChange({
                  ...tagCategory,
                  space_tags: {
                    ...tagCategory.space_tags,
                    data:
                      tagCategory.space_tags?.data.map((tagItem) =>
                        tagItem.id === tag.id
                          ? {
                              ...tagItem,
                              status: Space_Tag_Status_Enum.Accepted,
                            }
                          : tagItem
                      ) ?? [],
                  },
                });
              }}
              count={tagCountsMap?.[tag.id] ?? 0}
            />
          ))}
      </div>
    </div>
  );
}
