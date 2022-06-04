import React from "react";

import {
  Space_Listing_Question_Insert_Input,
  Space_Tag_Category_Insert_Input,
} from "../../generated/graphql";
import { Text } from "../atomic";
import { AddSectionButton } from "../create-space/AddSectionButton";
import { EditQuestion } from "../create-space/EditQuestion";
import { EditTagCategory } from "../create-space/EditTagCategory";

export type EditProfileSchemaData = {
  listingQuestions: Space_Listing_Question_Insert_Input[];
  tagCategories: Space_Tag_Category_Insert_Input[];
};

interface EditProfileSchemaProps {
  data: EditProfileSchemaData;
  onChange: (data: EditProfileSchemaData) => void;
}

export function EditProfileSchema(props: EditProfileSchemaProps) {
  const { data, onChange } = props;

  console.log(data);
  return (
    <div className="border border-black rounded-lg w-full flex flex-col pb-12">
      <div className="h-20 bg-gray-100 rounded-t-lg"></div>
      <div className="px-12 -mt-4">
        <div className="flex items-center gap-12">
          <div className="rounded-full h-32 w-32 bg-gray-400"></div>
          <div className="flex flex-col mt-4">
            <Text variant="heading4">Member Name</Text>
            <div className="h-1"></div>
            <Text variant="body1">
              Hello! This is my profile summary or bio.
            </Text>
          </div>
        </div>
        <div className="h-16"></div>

        <div className="grid grid-cols-2 gap-4">
          <div className="pt-4">
            {data.listingQuestions
              .filter((item) => item.deleted === false)
              .map((question, index) => {
                return (
                  <EditQuestion
                    question={question}
                    onSave={(newQuestion) => {
                      onChange({
                        listingQuestions: [
                          ...data.listingQuestions.slice(0, index),
                          newQuestion,
                          ...data.listingQuestions.slice(index + 1),
                        ],
                        tagCategories: data.tagCategories,
                      });
                    }}
                    onDelete={() => {
                      const delArr = question.id
                        ? [{ ...question, deleted: true }]
                        : [];
                      onChange({
                        listingQuestions: [
                          ...data.listingQuestions.slice(0, index),
                          ...delArr,
                          ...data.listingQuestions.slice(index + 1),
                        ],
                        tagCategories: data.tagCategories,
                      });
                    }}
                    key={index}
                  />
                );
              })}
            <AddSectionButton
              onClick={() => {
                onChange({
                  listingQuestions: [
                    ...data.listingQuestions,
                    {
                      title: "New Profile Question",
                      char_count: 200,
                    },
                  ],
                  tagCategories: data.tagCategories,
                });
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="bg-gray-50 rounded-md p-4">
              {data.tagCategories
                .filter((item) => item.deleted === false)
                .map((tagCategory, index) => {
                  return (
                    <EditTagCategory
                      tagCategory={tagCategory}
                      onSave={(newTagCategory) => {
                        onChange({
                          tagCategories: [
                            ...data.tagCategories.slice(0, index),
                            newTagCategory,
                            ...data.tagCategories.slice(index + 1),
                          ],
                          listingQuestions: data.listingQuestions,
                        });
                      }}
                      onDelete={() => {
                        const delArr = tagCategory.id
                          ? [{ ...tagCategory, deleted: true }]
                          : [];
                        onChange({
                          tagCategories: [
                            ...data.tagCategories.slice(0, index),
                            ...delArr,
                            ...data.tagCategories.slice(index + 1),
                          ],
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
                onChange({
                  tagCategories: [
                    ...data.tagCategories,
                    { title: "New Tag Category" },
                  ],
                  listingQuestions: data.listingQuestions,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
