import React from "react";

import { Button, Text } from "../../components/atomic";
import { EditProfileListing } from "../EditProfileListing";

import { StageDisplayWrapper } from "./StageDisplayWrapper";
import { StepDisplay } from "./StepDisplay";

interface ReviewProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Review(props: ReviewProps) {
  const { onComplete, onSkip } = props;

  return (
    <StageDisplayWrapper
      title="Yay, you did it! Next steps:"
      showActions={false}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>
        <div className="w-160 flex flex-col gap-4">
          <StepDisplay
            stepNumber={1}
            title="Review your profile below"
            description="Review and edit any section by clicking the tabs on the left. You can also returning to your account settings at any time to make changes."
          />
          <StepDisplay
            stepNumber={2}
            title="Publish your profile!"
            description="Once you click “Publish,” this profile page will appear in the community directory. "
          />
        </div>
        <div className="h-8"></div>
        <EditProfileListing showPublishedToggle={false} />
        <div className="h-16"></div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            rounded
            className="w-64 flex items-center justify-center"
          >
            Publish my profile
          </Button>
          <Button
            variant="outline"
            rounded
            className="w-64 flex items-center justify-center"
          >
            Save without publishing
          </Button>
        </div>
        <div className="h-8"></div>
        <Text variant="body2" className="text-gray-600">
          Remember, you can edit your profile in “My Account” at any time.
        </Text>
      </div>
    </StageDisplayWrapper>
  );
}
