import React from "react";

import {
  Space_Listing_Question_Insert_Input,
  Space_Tag_Category_Insert_Input,
} from "../../generated/graphql";
import { Button, Text } from "../atomic";

import { AddSectionButton } from "./AddSectionButton";
import { EditQuestion } from "./EditQuestion";
import { EditTagCategory } from "./EditTagCategory";

type EnterProfileSchemaData = {
  listingQuestions: Space_Listing_Question_Insert_Input[];
  tagCategories: Space_Tag_Category_Insert_Input[];
};

export interface EnterProfileSchemaProps {
  onComplete: () => void;
  onChange: (data: EnterProfileSchemaData) => void;
  data: EnterProfileSchemaData;
}

export function EnterProfileSchema(props: EnterProfileSchemaProps) {
  const { onComplete, data, onChange } = props;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Edit profile page format</Text>
      <div className="h-2"></div>
      <Text variant="subheading2" bold className="text-gray-600">
        Community member profiles will follow this format.
      </Text>
      <div className="h-8"></div>
      <div className="max-w-3xl border border-black rounded-lg w-full flex flex-col pb-12">
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
            <div>
              {data.listingQuestions.map((question, index) => {
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
                      onChange({
                        listingQuestions: [
                          ...data.listingQuestions.slice(0, index),
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
                {data.tagCategories.map((tagCategory, index) => {
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
                        onChange({
                          tagCategories: [
                            ...data.tagCategories.slice(0, index),
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
                      {
                        title: "New Tag Category",
                      },
                    ],
                    listingQuestions: data.listingQuestions,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-12"></div>
      <Button
        rounded
        onClick={() => {
          onComplete();
        }}
      >
        Save and continue
      </Button>
      <div className="h-20"></div>
    </div>
  );
}
