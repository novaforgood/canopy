import React from "react";

import { Text } from "../../components/atomic";
import { useProfileListingSocialsQuery } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";

import { ProfileSocialsInput } from "./ProfileSocialsInput";
import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface EnterContactInfoProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EnterContactInfo(props: EnterContactInfoProps) {
  const { onComplete, onSkip } = props;

  return (
    <StageDisplayWrapper
      title="Contact info"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <Text variant="subheading2" className="text-gray-600 font-bold">
          Email and social platforms
        </Text>
        <div className="h-4"></div>
        <ProfileSocialsInput />
      </div>
    </StageDisplayWrapper>
  );
}
