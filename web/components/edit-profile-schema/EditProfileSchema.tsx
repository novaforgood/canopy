import React from "react";

import {
  DndContext,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";

import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { getTempId, isTempId } from "../../lib/tempId";
import { Text } from "../atomic";

import { AddSectionButton } from "./AddSectionButton";
import { EditQuestion } from "./EditQuestion";
import { EditTagCategory } from "./EditTagCategory";

import type { NewListingQuestion, NewTagCategory } from "../../lib/types";

/**
 * If item has a uuid, mark it as deleted.
 * Otherwise, set to null to be filtered out.
 */
function deleteItemFromList<TItem extends { id?: string | null }>(
  list: TItem[],
  idToDelete?: string | null
) {
  return list
    .map((item: TItem) => {
      if (!item.id || !idToDelete) {
        return null;
      }
      if (item.id === idToDelete) {
        if (isTempId(item.id)) {
          return null;
        } else {
          return { ...item, deleted: true };
        }
      } else {
        return item;
      }
    })
    .filter((item) => item !== null) as TItem[];
}

/**
 * If item in array has the same id, replace it with the new item
 */
function updateItemInList<TItem extends { id?: string | null }>(
  list: TItem[],
  newItem: TItem
) {
  return list.map((item: TItem) => {
    if (!item.id) {
      return item;
    }
    if (item.id === newItem.id) {
      return newItem;
    } else {
      return item;
    }
  });
}

export type EditProfileSchemaData = {
  listingQuestions: NewListingQuestion[];
  tagCategories: NewTagCategory[];
};

interface EditProfileSchemaProps {
  data: EditProfileSchemaData;
  onChange: (data: EditProfileSchemaData) => void;

  /**
   * If true, all listingQuestions and tagCategories must have a space_id.
   *
   * (false when creating a space)
   */
  requireSpace?: boolean;
}

export function EditProfileSchema(props: EditProfileSchemaProps) {
  const { data, onChange, requireSpace = true } = props;

  const { currentSpace } = useCurrentSpace();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd =
    (key: "listingQuestions" | "tagCategories") => (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active || !over) {
        return;
      }

      if (active.id !== over.id) {
        const ids = data[key].map((item) => item.id);
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);

        const newList = arrayMove<NewListingQuestion | NewTagCategory>(
          data[key],
          oldIndex,
          newIndex
        );
        onChange({ ...data, [key]: newList });
      }
    };

  return (
    <div className="flex w-full flex-col rounded-lg border border-black pb-12">
      <div className="h-20 rounded-t-lg bg-gray-100"></div>
      <div className="-mt-4 px-12">
        <div className="flex items-center gap-12">
          <div className="h-32 w-32 shrink-0 rounded-full bg-gray-400"></div>
          <div className="mt-4 flex flex-col">
            <Text variant="heading4">Member Name</Text>
            <div className="h-1"></div>
            <Text variant="body1">
              Hello! This is my profile summary or bio.
            </Text>
          </div>
        </div>
        <div className="h-16"></div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="pt-4">
              <Text variant="heading4" bold className="-mb-4">
                Profile Questions
              </Text>
              <div className="h-8"></div>
              <div className="flex flex-col gap-12">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd("listingQuestions")}
                >
                  <SortableContext
                    items={data.listingQuestions}
                    strategy={verticalListSortingStrategy}
                  >
                    {data.listingQuestions.map((question, index) => {
                      if (question.deleted) {
                        return null;
                      }
                      return (
                        <EditQuestion
                          question={question}
                          onSave={(newQuestion) => {
                            onChange({
                              ...data,
                              listingQuestions: updateItemInList(
                                data.listingQuestions,
                                newQuestion
                              ),
                            });
                          }}
                          onDelete={() => {
                            onChange({
                              ...data,
                              listingQuestions: deleteItemFromList(
                                data.listingQuestions,
                                question.id
                              ),
                            });
                          }}
                          key={question.id}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            <div className="h-8"></div>
            <AddSectionButton
              onClick={() => {
                if (requireSpace) {
                  if (!currentSpace) {
                    toast.error("currentSpace not present");
                    return;
                  }

                  onChange({
                    listingQuestions: [
                      ...data.listingQuestions,
                      {
                        id: getTempId(),
                        space_id: currentSpace.id,
                        title: "New Profile Question",
                        char_count: 200,
                        deleted: false,
                      },
                    ],
                    tagCategories: data.tagCategories,
                  });
                } else {
                  onChange({
                    listingQuestions: [
                      ...data.listingQuestions,
                      {
                        id: getTempId(),
                        title: "New Profile Question",
                        char_count: 200,
                        deleted: false,
                      },
                    ],
                    tagCategories: data.tagCategories,
                  });
                }
              }}
            >
              + Add Profile Question
            </AddSectionButton>
          </div>
          <div className="flex flex-col">
            <div className="rounded-md bg-gray-50 p-4 ">
              <Text variant="heading4" bold>
                Tags
              </Text>
              <div className="h-8"></div>
              <div className="flex flex-col gap-12">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd("tagCategories")}
                >
                  <SortableContext
                    items={data.tagCategories}
                    strategy={verticalListSortingStrategy}
                  >
                    {data.tagCategories.map((tagCategory, index) => {
                      if (tagCategory.deleted) {
                        return null;
                      }
                      return (
                        <EditTagCategory
                          tagCategory={tagCategory}
                          onSave={(newTagCategory) => {
                            onChange({
                              tagCategories: updateItemInList(
                                data.tagCategories,
                                newTagCategory
                              ),
                              listingQuestions: data.listingQuestions,
                            });
                          }}
                          onDelete={() => {
                            onChange({
                              tagCategories: deleteItemFromList(
                                data.tagCategories,
                                tagCategory.id
                              ),
                              listingQuestions: data.listingQuestions,
                            });
                          }}
                          key={tagCategory.id}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            <div className="h-2"></div>
            <AddSectionButton
              onClick={() => {
                if (requireSpace) {
                  if (!currentSpace) {
                    toast.error("currentSpace not present");
                    return;
                  }
                  onChange({
                    tagCategories: [
                      ...data.tagCategories,
                      {
                        id: getTempId(),
                        title: "New Tag Category",
                        deleted: false,
                        space_id: currentSpace.id,
                        rigid_select: false,
                      },
                    ],
                    listingQuestions: data.listingQuestions,
                  });
                } else {
                  onChange({
                    tagCategories: [
                      ...data.tagCategories,
                      {
                        id: getTempId(),
                        title: "New Tag Category",
                        deleted: false,
                        rigid_select: true,
                      },
                    ],
                    listingQuestions: data.listingQuestions,
                  });
                }
              }}
            >
              + Add Tag Category
            </AddSectionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
