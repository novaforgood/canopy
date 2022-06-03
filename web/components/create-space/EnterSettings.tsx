import React from "react";

import { Button, Input, Text } from "../atomic";
import { TextInput } from "../inputs/TextInput";

type EnterSettingsData = {
  spaceSlug: string;
};
interface EnterSettingsProps {
  onComplete: () => void;
  data: EnterSettingsData;
  onChange: (newData: EnterSettingsData) => void;
}

export function EnterSettings(props: EnterSettingsProps) {
  const { onComplete = () => {}, data, onChange = () => {} } = props;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Directory Settings</Text>
      <div className="h-10"></div>
      <TextInput
        className="w-96"
        value={data.spaceSlug}
        label="Domain name"
        onValueChange={(newVal) => {
          onChange({ ...data, spaceSlug: newVal });
        }}
      />
      <Text className="mt-2 text-gray-600">
        Anyone can access your public homepage via{" "}
        <Text underline>
          {`${window.location.origin}/space/${data.spaceSlug}`}
        </Text>
      </Text>
      <div className="h-12"></div>
      <Button
        // disabled={!name}
        floating
        rounded
        onClick={() => {
          onComplete();
        }}
      >
        Create program
      </Button>
    </div>
  );
}
