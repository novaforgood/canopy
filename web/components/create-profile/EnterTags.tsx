import React from "react";

import { Text } from "../../components/atomic";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

export interface EnterTagsProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterTags(props: EnterTagsProps) {
  const { onComplete, onSkip } = props;

  return (
    <StageDisplayWrapper
      title="Tags"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <Text variant="subheading2" className="text-gray-600 font-bold">
          Tags
        </Text>
        <div className="h-4"></div>
        <Text variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis
          mattis lorem.
        </Text>
      </div>
    </StageDisplayWrapper>
  );
}
