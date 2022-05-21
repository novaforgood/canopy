import React from "react";

import { Text } from "../atomic";
import { ImageUploader } from "../ImageUploader";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface EnterNameProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterBasicInfo(props: EnterNameProps) {
  const { onComplete, onSkip } = props;

  return (
    <StageDisplayWrapper
      title="Basic information"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <Text variant="subheading2" className="text-gray-600 font-bold">
          Profile photo
        </Text>
        <div className="h-4"></div>
        <ImageUploader width={300} height={300} />
      </div>
    </StageDisplayWrapper>
  );
}
