import React from "react";

import { Text } from "../../components/atomic";
import { EditProfileListing } from "../EditProfileListing";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface ReviewProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Review(props: ReviewProps) {
  const { onComplete, onSkip } = props;

  return (
    <StageDisplayWrapper
      title="Review"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <Text variant="subheading2" className="text-gray-600 font-bold">
          Review
        </Text>
        <div className="h-4"></div>
        <EditProfileListing />
        <div className="h-8"></div>
      </div>
    </StageDisplayWrapper>
  );
}
