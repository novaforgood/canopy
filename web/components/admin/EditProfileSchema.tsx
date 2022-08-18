import React from "react";

import toast from "react-hot-toast";

import {
  Space_Listing_Question_Insert_Input,
  Space_Tag_Category_Insert_Input,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { getTempId, isTempId } from "../../lib/tempId";
import { Text } from "../atomic";
import { AddSectionButton } from "../create-space/AddSectionButton";
import { EditQuestion } from "../create-space/EditQuestion";
import { EditTagCategory } from "../create-space/EditTagCategory";

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
  listingQuestions: Space_Listing_Question_Insert_Input[];
  tagCategories: Space_Tag_Category_Insert_Input[];
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

  return (
    <div className="border border-black rounded-lg w-full flex flex-col pb-12">
      <div className="h-20 bg-gray-100 rounded-t-lg"></div>
      <div className="px-12 -mt-4">
        <div className="flex items-center gap-12">
          <div className="rounded-full h-32 w-32 shrink-0 bg-gray-400"></div>
          <div className="flex flex-col mt-4">
            <Text variant="heading4">Member Name</Text>
            <div className="h-1"></div>
            <Text variant="body1">
              Hello! This is my profile summary or bio.
            </Text>
          </div>
        </div>
        <div className="h-16"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="pt-4 flex flex-col gap-12">
              <Text variant="heading4" bold className="-mb-4">
                Profile Questions
              </Text>
              {data.listingQuestions
                .filter((item) => item.deleted === false)
                .map((question, index) => {
                  return (
                    <EditQuestion
                      question={question}
                      onSave={(newQuestion) => {
                        onChange({
                          listingQuestions: updateItemInList(
                            data.listingQuestions,
                            newQuestion
                          ),
                          tagCategories: data.tagCategories,
                        });
                      }}
                      onDelete={() => {
                        onChange({
                          listingQuestions: deleteItemFromList(
                            data.listingQuestions,
                            question.id
                          ),
                          tagCategories: data.tagCategories,
                        });
                      }}
                      key={index}
                    />
                  );
                })}
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
            <div className="bg-gray-50 rounded-md p-4 flex flex-col gap-12">
              <Text variant="heading4" bold className="-mb-4">
                Tags
              </Text>
              {data.tagCategories
                .filter((item) => item.deleted === false)
                .map((tagCategory, index) => {
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
                      key={index}
                    />
                  );
                })}
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
                        title: "New Tag Category",
                        deleted: false,
                        space_id: currentSpace.id,
                      },
                    ],
                    listingQuestions: data.listingQuestions,
                  });
                } else {
                  onChange({
                    tagCategories: [
                      ...data.tagCategories,
                      {
                        title: "New Tag Category",
                        deleted: false,
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
