import React, { useState } from "react";

import { Button, Input, Text } from "../atomic";
import { TextInput } from "../inputs/TextInput";

type EnterSettingsData = {
  spaceSlug: string;
  editedSlug: boolean;
};
interface EnterSettingsProps {
  onComplete: () => void | Promise<void>;
  data: EnterSettingsData;
  onChange: (newData: EnterSettingsData) => void;
}

export function EnterSettings(props: EnterSettingsProps) {
  const { onComplete = () => {}, data, onChange = () => {} } = props;

  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Directory Settings</Text>
      <div className="h-10"></div>
      <div className="w-96">
        <TextInput
          characterLimit={60}
          value={data.spaceSlug}
          label="Domain name"
          onValueChange={(newVal) => {
            onChange({ ...data, spaceSlug: newVal, editedSlug: true });
          }}
        />
      </div>

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
        loading={loading}
        onClick={async () => {
          setLoading(true);
          await onComplete();
          setLoading(false);
        }}
      >
        Create directory
      </Button>
    </div>
  );
}
