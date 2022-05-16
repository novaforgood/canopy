import React, { useState } from "react";
import { Button, Input, Text } from "../atomic";
import { useCreateOwnerProfileInNewSpaceMutation } from "../../generated/graphql";
import { useUserData } from "../../hooks/useUserData";
import { useRouter } from "next/router";

type EnterNameData = {
  spaceName: string;
};
interface EnterNameProps {
  onComplete: () => void;
  data: EnterNameData;
  onChange: (newData: EnterNameData) => void;
}

export function EnterName(props: EnterNameProps) {
  const { onComplete, data, onChange } = props;

  const [_, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { userData } = useUserData();

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">What is the name of your community?</Text>
      <div className="h-2"></div>
      <Text variant="subheading2" bold className="text-gray-600">
        This will become the name of your directory.
      </Text>
      <div className="h-8"></div>
      <Input
        className="w-120"
        value={data.spaceName}
        onValueChange={(value) => {
          onChange({ ...data, spaceName: value });
          setError(null);
        }}
        placeholder="Ex. Rainbow Buddies, UCLA SWE, etc."
      />
      {error && <div className="text-red-500">{error}</div>}
      <div className="h-20"></div>
      <Button
        // disabled={!name}
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
