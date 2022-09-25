import { useMemo } from "react";

import {
  Space_Tag_Status_Enum,
  useTagCountsQuery,
} from "../../../generated/graphql";
import { NewTagCategory } from "../../../lib/types";
import { Text } from "../../atomic";

import { PendingTagItem } from "./PendingTagItem";

interface AddSuggestedTagProps {
  tagCategory: NewTagCategory;
  onChange: (newTagCategory: NewTagCategory) => void;
}

export function AddSuggestedTag(props: AddSuggestedTagProps) {
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

  const pendingTags = tagCategory.space_tags?.data.filter(
    (tag) => tag.status === Space_Tag_Status_Enum.Pending
  );

  console.log(tagCategory.rigid_select);
  return (
    <div className="w-full">
      {tagCategory.rigid_select && (
        <>
          <div className="h-4"></div>
          <Text variant="body2" italic medium>
            Allow users to suggest their own tag using the toggle switch above.
          </Text>
        </>
      )}
      {pendingTags && pendingTags.length === 0 ? (
        <>
          <div className="h-4"></div>
          <Text className="text-gray-600" variant="body2">
            No pending tags.
          </Text>
        </>
      ) : (
        <>
          <div className="h-4"></div>
          <Text className="text-gray-600" variant="body2">
            These tags were inputted by members. They appear on profiles but not
            the directory filters. Click the checkmark to make the tag official.
            Or, click X to ban the tag and prevent users from setting it.
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
            {pendingTags?.map((tag) => (
              <PendingTagItem
                key={tag.id}
                tag={tag}
                onApprove={() => {
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
                onDeny={() => {
                  onChange({
                    ...tagCategory,
                    space_tags: {
                      ...tagCategory.space_tags,
                      data:
                        tagCategory.space_tags?.data.map((tagItem) =>
                          tagItem.id === tag.id
                            ? {
                                ...tagItem,
                                status: Space_Tag_Status_Enum.Deleted,
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
        </>
      )}
    </div>
  );
}
