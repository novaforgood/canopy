import React, { ReactNode, useEffect, useState } from "react";

import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { EnterBasicInfo } from "../../../components/create-profile/EnterBasicInfo";
import { EnterContactInfo } from "../../../components/create-profile/EnterContactInfo";
import { EnterResponses } from "../../../components/create-profile/EnterResponses";
import { EnterTags } from "../../../components/create-profile/EnterTags";
import { Review } from "../../../components/create-profile/Review";
import { StepDisplay } from "../../../components/create-profile/StepDisplay";
import { StageNavigator } from "../../../components/StageNavigator";
import { FadeTransition } from "../../../components/transitions/FadeTransition";
import { TwoThirdsPageLayout } from "../../../components/TwoThirdsPageLayout";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useQueryParam } from "../../../hooks/useQueryParam";
import { useUpdateQueryParams } from "../../../hooks/useUpdateQueryParams";

enum ListerStage {
  EnterBasicInfo = "EnterBasicInfo",
  EnterResponses = "EnterResponses",
  EnterTags = "EnterTags",
  EnterContactInfo = "EnterContactInfo",
  Review = "Review",
}

const MAP_STAGE_TO_LABEL: Record<ListerStage, string> = {
  [ListerStage.EnterBasicInfo]: "Basic Info",
  [ListerStage.EnterResponses]: "Profile",
  [ListerStage.EnterTags]: "Tags",
  [ListerStage.EnterContactInfo]: "Contact Info",
  [ListerStage.Review]: "Review",
};

const ALL_LISTER_STAGES = Object.values(ListerStage).map((val) => {
  return {
    value: val,
    label: MAP_STAGE_TO_LABEL[val],
  };
});

export default function ListerOnboardingPage() {
  const router = useRouter();
  const currentStage = (useQueryParam("stage", "string") ??
    ListerStage.EnterBasicInfo) as ListerStage;
  const { updateQueryParams } = useUpdateQueryParams();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile, fetchingCurrentProfile } = useCurrentProfile();

  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (currentProfile?.profile_listing) {
      setShowIntro(false);
    }
  }, [currentProfile?.profile_listing]);

  const [stageDisplayed, setStageDisplayed] = useState<ListerStage | null>(
    null
  );
  useEffect(() => {
    async function changeStageDisplay() {
      setStageDisplayed(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setStageDisplayed(currentStage);
    }
    changeStageDisplay();
  }, [currentStage]);

  // Navigate to a stage
  const navStage = (stage: ListerStage) => {
    updateQueryParams({ stage });
  };

  if (fetchingCurrentProfile) {
    return <div>Loading...</div>;
  }

  if (showIntro) {
    return (
      <TwoThirdsPageLayout>
        <div className="h-screen flex flex-col items-start justify-center px-16 max-w-2xl">
          <Text variant="heading2">Welcome to {currentSpace?.name}!</Text>

          <div className="h-12"></div>
          <Text className="text-gray-600">Here are your next steps:</Text>
          <div className="h-8"></div>
          <div className="w-160 flex flex-col gap-4">
            <StepDisplay
              stepNumber={1}
              title="Complete your profile"
              description="It takes 3 minutes, and your profile can be edited or unpublished at any time."
              highlighted
            />
            <StepDisplay
              stepNumber={2}
              title="Publish your profile in the community directory"
              description="Other community members will reach out to you through a profile contact button"
            />
            <StepDisplay
              stepNumber={3}
              title="Wait for a connection request!"
              description="Whenever someone reaches out, you will be notified via email. Please respond promptly to schedule a meeting time"
            />
          </div>
          <div className="h-16"></div>
          <Button
            variant="primary"
            rounded
            onClick={() => {
              setShowIntro(false);
            }}
          >
            Create my profile
          </Button>

          <div className="h-40"></div>
        </div>
      </TwoThirdsPageLayout>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="bg-gray-50 p-12 pt-40 h-screen flex-none">
        <StageNavigator
          currentStage={currentStage}
          stages={ALL_LISTER_STAGES}
          enabledStages={ALL_LISTER_STAGES.map((s) => s.value)}
          onStageClick={(newStage) => {
            navStage(newStage);
          }}
        />
      </div>
      {/* <BackButton
          onClick={() => {
            switch (currentStage) {
              case ListerStage.EnterBasicInfo:
                router.push("/");
                break;
              case ListerStage.EnterResponses:
                navStage(ListerStage.EnterBasicInfo);
                break;
              case ListerStage.EnterTags:
                navStage(ListerStage.EnterResponses);
                break;
              default:
                break;
            }
          }}
        /> */}
      <div className="relative w-full overflow-y-auto">
        <FadeTransition show={stageDisplayed === ListerStage.EnterBasicInfo}>
          <EnterBasicInfo
            onComplete={() => {
              navStage(ListerStage.EnterResponses);
            }}
            onSkip={() => {
              navStage(ListerStage.EnterResponses);
            }}
          />
        </FadeTransition>
        <FadeTransition show={stageDisplayed === ListerStage.EnterResponses}>
          <EnterResponses
            onComplete={() => {
              navStage(ListerStage.EnterTags);
            }}
            onSkip={() => {
              navStage(ListerStage.EnterTags);
            }}
          />
        </FadeTransition>
        <FadeTransition show={stageDisplayed === ListerStage.EnterTags}>
          <EnterTags
            onComplete={() => {
              navStage(ListerStage.EnterContactInfo);
            }}
            onSkip={() => {
              navStage(ListerStage.EnterContactInfo);
            }}
          />
        </FadeTransition>
        <FadeTransition show={stageDisplayed === ListerStage.EnterContactInfo}>
          <EnterContactInfo
            onComplete={() => {
              navStage(ListerStage.Review);
            }}
            onSkip={() => {
              navStage(ListerStage.Review);
            }}
          />
        </FadeTransition>
        <FadeTransition show={stageDisplayed === ListerStage.Review}>
          <Review
            onComplete={() => {
              router.push(`/space/${currentSpace?.slug}`);
            }}
          />
        </FadeTransition>
      </div>
    </div>
  );
}
