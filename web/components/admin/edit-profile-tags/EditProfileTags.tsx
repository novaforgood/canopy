import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Tab } from "@headlessui/react";
import toast from "react-hot-toast";

import {
  Space_Tag_Constraint,
  Space_Tag_Status_Enum,
  Space_Tag_Update_Column,
  useSpaceTagCategoriesQuery,
  useTagCountsQuery,
  useUpsertSpaceProfileSchemaMutation,
} from "../../../generated/graphql";
import { BxDownArrow, BxDownArrowAlt } from "../../../generated/icons/regular";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../../hooks/useSaveChangesState";
import { isTempId, resolveId } from "../../../lib/tempId";
import { NewSpaceTag, NewTagCategory } from "../../../lib/types";
import { Button, Select, Text } from "../../atomic";
import { CustomTab } from "../../CustomTab";
import { RoundedCard } from "../../RoundedCard";
import { Tag } from "../../Tag";

import { AddSuggestedTag } from "./AddSuggestedTag";
import { ApprovedTagItem } from "./ApprovedTagItem";
import { CreateNewTag } from "./CreateNewTag";
import RigidToggleSwitch from "./RigidToggleSwitch";
import { ViewDeletedTags } from "./ViewDeletedTags";

export function EditProfileTags() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data: spaceTagCategoriesData }, refetchData] =
    useSpaceTagCategoriesQuery({
      variables: { space_id: currentSpace?.id ?? "" },
    });

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
      spaceTagCategoriesData?.space_tag_category
        .filter((cat) => cat.deleted === false)
        .map((category) => ({
          label: category.title,
          value: category.id,
        })) ?? [],
    [spaceTagCategoriesData?.space_tag_category]
  );

  const { mustSave, setMustSave } = useSaveChangesState();

  const [tabIndex, setTabIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const [data, _setData] = useState<NewTagCategory | null>(null);
  const setData: Dispatch<SetStateAction<NewTagCategory | null>> = useCallback(
    (d) => {
      _setData(d);
      setMustSave(true);
    },
    [setMustSave]
  );

  useEffect(() => {
    setVisible(false);
    setTimeout(() => {
      setVisible(true);
    }, 100);
  }, [selectedTagCategoryId]);

  const updateData = useCallback(() => {
    const selectedTagCategory =
      spaceTagCategoriesData?.space_tag_category.find(
        (category) => category.id === selectedTagCategoryId
      ) ?? null;
    if (!selectedTagCategory) return;

    console.log(selectedTagCategory);
    setData({
      ...selectedTagCategory,
      space_tags: { data: selectedTagCategory.space_tags },
    });
    setMustSave(false);
  }, [
    spaceTagCategoriesData?.space_tag_category,
    setData,
    setMustSave,
    selectedTagCategoryId,
  ]);

  useEffect(() => {
    if (mustSave) {
      return;
    }
    updateData();
  }, [mustSave, updateData]);

  const [loading, setLoading] = useState(false);
  const [_, upsertSpaceProfileSchema] = useUpsertSpaceProfileSchemaMutation();
  const saveChanges = useCallback(async () => {
    if (!selectedTagCategoryId) {
      toast.error("No tag category selected");
      return;
    }
    setLoading(true);

    console.log(data);
    await upsertSpaceProfileSchema({
      space_listing_questions: [],
      space_tag_categories: {
        ...data,
        space_tags: {
          data:
            data?.space_tags?.data.map((tag, index) => ({
              ...tag,
              id: resolveId(tag.id),
              listing_order: index,
            })) ?? [],
          on_conflict: {
            constraint: Space_Tag_Constraint.SpaceTagLabelSpaceTagCategoryIdKey,
            update_columns: [
              Space_Tag_Update_Column.Status,
              Space_Tag_Update_Column.ListingOrder,
              Space_Tag_Update_Column.SpaceTagCategoryId,
            ],
          },
        },
      },
    })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Saved");
          refetchData();
          setMustSave(false);
        }
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    data,
    refetchData,
    selectedTagCategoryId,
    setMustSave,
    upsertSpaceProfileSchema,
  ]);

  return (
    <div className="w-full">
      <Text variant="subheading1">Select Tag Field</Text>
      <div className="h-2"></div>
      <Select
        className="w-64"
        placeholder="Select..."
        options={tagCategoryOptions}
        value={selectedTagCategoryId}
        onSelect={(newVal) => {
          const canChange =
            !mustSave ||
            window.confirm(
              "You have unsaved changes. Discard current changes?"
            );
          if (canChange) {
            setSelectedTagCategoryId(newVal);
            setMustSave(false);
          }
        }}
      />
      <div className="my-12 h-0.25 w-full bg-black"></div>
      {data ? (
        visible ? (
          <div className="animate-enter">
            <div>
              <RigidToggleSwitch tagCategoryId={data.id} />
            </div>
            <div className="h-8"></div>

            <div>
              <Text variant="subheading1">
                Add official tag options for {`"${data.title}"`}
              </Text>

              {mustSave && (
                <>
                  <div className="h-2"></div>
                  <Text variant="body2" style={{ color: "red" }}>
                    You must click {'"Save Changes"'} for your changes to take
                    effect.
                  </Text>
                </>
              )}
              <div className="h-4"></div>

              <RoundedCard>
                <Text variant="subheading2" medium>
                  Create or Approve Tags
                </Text>
                <div className="h-2"></div>
                <Text variant="body2" className="text-gray-600">
                  Use the options below to set official directory tags.
                </Text>
                <div className="h-6"></div>
                <Tab.Group
                  selectedIndex={tabIndex}
                  onChange={setTabIndex}
                  defaultIndex={0}
                >
                  <Tab.List className="flex items-center gap-8">
                    <CustomTab title="Create tags"></CustomTab>
                    <CustomTab title="Approve tags from members"></CustomTab>
                    <CustomTab title="View banned tags"></CustomTab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <CreateNewTag tagCategory={data} onChange={setData} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <AddSuggestedTag tagCategory={data} onChange={setData} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ViewDeletedTags tagCategory={data} onChange={setData} />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </RoundedCard>
              <div className="h-2"></div>
              <div className="flex w-full justify-center">
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
                  {data.space_tags?.data
                    .filter(
                      (tag) => tag.status === Space_Tag_Status_Enum.Accepted
                    )
                    .map((tag, index) => (
                      <ApprovedTagItem
                        key={tag.id}
                        tag={tag}
                        onDelete={() => {
                          setData((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              space_tags: {
                                ...prev.space_tags,
                                data:
                                  prev.space_tags?.data.map((tagItem) =>
                                    tagItem.id === tag.id
                                      ? {
                                          ...tagItem,
                                          status: Space_Tag_Status_Enum.Deleted,
                                        }
                                      : tagItem
                                  ) ?? [],
                              },
                            };
                          });
                        }}
                        count={tagCountsMap?.[tag.id ?? ""] ?? 0}
                      ></ApprovedTagItem>
                    ))}
                </div>
              </RoundedCard>

              <div className="h-8"></div>
              <Button
                disabled={!mustSave}
                rounded
                onClick={saveChanges}
                loading={loading}
              >
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <div />
        )
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
