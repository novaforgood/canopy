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
  onAddTag: (newTagCategory: NewTagCategory) => void;
}

export function AddSuggestedTag(props: AddSuggestedTagProps) {
  const { tagCategory, onAddTag } = props;

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
      {tagCategory.rigid_select ? (
        <>
          <div className="h-4"></div>
          <Text className="text-gray-600" variant="body2">
            You must allow users to suggest their own tag first, using the
            toggle switch above.
          </Text>
        </>
      ) : (
        <>
          <div className="h-4"></div>
          <Text className="text-gray-600" variant="body2">
            These tags were inputted by members. Click the checkmark to add tag
            to official directory list.
          </Text>
          <div className="h-6"></div>
          <div className="flex items-center gap-3 pl-2 select-none">
            <div className="rounded-full h-8 w-8 bg-gray-200 flex items-center justify-center">
              <Text variant="body3" bold>
                #
              </Text>
            </div>
            <Text variant="body2" className="text-gray-600" italic>
              number of member usages
            </Text>
          </div>
          <div className="h-4"></div>
          <div className="flex flex-col gap-1.5 max-h-96 overflow-y-scroll overscroll-contain pr-3">
            {tagCategory.space_tags?.data
              .filter((tag) => tag.status === Space_Tag_Status_Enum.Pending)
              .map((tag) => (
                <PendingTagItem
                  key={tag.id}
                  tag={tag}
                  onApprove={() => {}}
                  onDeny={() => {}}
                  count={tagCountsMap?.[tag.id ?? ""] ?? 0}
                ></PendingTagItem>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
