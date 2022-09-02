import { useCallback, useEffect, useMemo, useState } from "react";

import { Tab } from "@headlessui/react";
import classNames from "classnames";

import {
  Space_Tag_Status_Enum,
  useTagCountsQuery,
} from "../../../generated/graphql";
import { BxDownArrow, BxDownArrowAlt } from "../../../generated/icons/regular";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { NewSpaceTag, NewTagCategory } from "../../../lib/types";
import { Select, Text } from "../../atomic";
import { RoundedCard } from "../../RoundedCard";
import { Tag } from "../../Tag";

import { AddSuggestedTag } from "./AddSuggestedTag";
import { ApprovedTagItem } from "./ApprovedTagItem";
import { CreateNewTag } from "./CreateNewTag";
import RigidToggleSwitch from "./RigidToggleSwitch";

interface CustomTabProps {
  title: string;
}
function CustomTab(props: CustomTabProps) {
  const { title } = props;

  return (
    <Tab>
      {({ selected }) => (
        <div
          className={classNames({
            "pb-1 border-b-2": true,
            "border-gray-400": !selected,
            "border-gray-900": selected,
          })}
        >
          <Text
            bold
            className={classNames({
              "text-gray-400": !selected,
              "text-gray-900": selected,
            })}
          >
            {title}
          </Text>
        </div>
      )}
    </Tab>
  );
}

export function EditProfileTags() {
  const { currentSpace, refetchCurrentSpace } = useCurrentSpace();

  const [selectedTagCategoryId, setSelectedTagCategoryId] = useState<
    string | null
  >(null);

  const [{ data: tagCountsData }] = useTagCountsQuery({
    pause: !selectedTagCategoryId,
    variables: {
      space_tag_category_id: selectedTagCategoryId ?? "",
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
    [tagCountsData]
  );

  const tagCategoryOptions = useMemo(
    () =>
      currentSpace?.space_tag_categories.map((category) => ({
        label: category.title,
        value: category.id,
      })) ?? [],
    [currentSpace?.space_tag_categories]
  );

  const [tabIndex, setTabIndex] = useState(0);

  const [data, setData] = useState<NewTagCategory | null>(null);

  const [edited, setEdited] = useState(false);

  useEffect(() => {
    const selectedTagCategory =
      currentSpace?.space_tag_categories.find(
        (category) => category.id === selectedTagCategoryId
      ) ?? null;
    console.log("useEffect triggered");
    if (!selectedTagCategory) return;

    setData({
      ...selectedTagCategory,
      space_tags: { data: selectedTagCategory.space_tags },
    });
    setEdited(false);
  }, [currentSpace?.space_tag_categories, selectedTagCategoryId]);

  return (
    <div className="w-full">
      <Text variant="subheading1">Select Tag Field</Text>
      <div className="h-2"></div>
      <Select
        className="w-64"
        options={tagCategoryOptions}
        value={selectedTagCategoryId}
        onSelect={setSelectedTagCategoryId}
      />
      <div className="h-0.25 w-full bg-black my-12"></div>
      {data ? (
        <>
          <div>
            <RigidToggleSwitch tagCategoryId={data.id} />
          </div>
          <div className="h-8"></div>

          <div>
            <Text variant="subheading1">
              Add official tag options for {`"${data.title}"`}
            </Text>
            <div className="h-4"></div>
            <RoundedCard>
              <Tab.Group
                selectedIndex={tabIndex}
                onChange={setTabIndex}
                defaultIndex={0}
              >
                <Tab.List className="flex items-center gap-8">
                  <CustomTab title="Create tags"></CustomTab>
                  <CustomTab title="Approve tags from members"></CustomTab>
                  <CustomTab title="View deleted tags"></CustomTab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <CreateNewTag tagCategory={data} onAddTag={setData} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <AddSuggestedTag tagCategory={data} onAddTag={setData} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </RoundedCard>
            <div className="h-2"></div>
            <div className="w-full flex justify-center">
              <BxDownArrowAlt className="h-8 w-8" />
            </div>
            <div className="h-2"></div>
            <RoundedCard>
              <Text variant="subheading2" medium>
                Official Directory Tags
              </Text>
              <div className="h-2"></div>
              <Text variant="body2" className="text-gray-600">
                These appear in the directory filters.
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
                {data.space_tags?.data
                  .filter(
                    (tag) => tag.status === Space_Tag_Status_Enum.Accepted
                  )
                  .map((tag, index) => (
                    <ApprovedTagItem
                      key={tag.id}
                      tag={tag}
                      onDelete={() => {}}
                      count={tagCountsMap?.[tag.id ?? ""] ?? 0}
                    ></ApprovedTagItem>
                  ))}
              </div>
            </RoundedCard>
          </div>
        </>
      ) : (
        <>
          <Text className="text-gray-600">
            Select a tag field to edit its tags. You can create new tag fields
            under {'"Edit Profile Format"'}.
          </Text>
        </>
      )}
    </div>
  );
}
