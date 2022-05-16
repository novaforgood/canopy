import React from "react";

import { Button, Input, Text } from "../atomic";

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
      <Input
        className="w-96"
        value={data.spaceSlug}
        onValueChange={(newVal) => {
          onChange({ ...data, spaceSlug: newVal });
        }}
      />
      <div className="h-12"></div>
      <Button
        // disabled={!name}
        floating
        rounded
        onClick={() => {
          onComplete();
        }}
      >
        Save and continue
      </Button>
    </div>
  );
}
