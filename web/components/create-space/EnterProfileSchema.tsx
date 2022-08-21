import React from "react";

import { Button, Text } from "../atomic";
import {
  EditProfileSchema,
  EditProfileSchemaData,
} from "../edit-profile-schema/EditProfileSchema";

export interface EnterProfileSchemaProps {
  onComplete: () => void;
  onChange: (data: EditProfileSchemaData) => void;
  data: EditProfileSchemaData;
}

export function EnterProfileSchema(props: EnterProfileSchemaProps) {
  const { onComplete, data, onChange } = props;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Edit profile page format</Text>
      <div className="h-2"></div>
      <Text variant="subheading2" bold className="text-gray-600 w-200">
        Directory profiles will follow the format below. You can change the
        Profile Questions and Tags to make it relevant to your community.
      </Text>
      <div className="h-8"></div>

      <div className="max-w-3xl">
        <EditProfileSchema
          requireSpace={false}
          data={data}
          onChange={onChange}
        />
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
