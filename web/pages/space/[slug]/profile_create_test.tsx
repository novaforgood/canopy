import React, { ReactNode, useEffect, useState } from "react";

import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";

import { EnterBasicInfo } from "../../../components/create-profile/EnterBasicInfo";
import { EnterContactInfo } from "../../../components/create-profile/EnterContactInfo";
import { EnterResponses } from "../../../components/create-profile/EnterResponses";
import { EnterTags } from "../../../components/create-profile/EnterTags";
import { Review } from "../../../components/create-profile/Review";
import { StageNavigator } from "../../../components/StageNavigator";
import { FadeTransition } from "../../../components/transitions/FadeTransition";
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
  [ListerStage.EnterResponses]: "Responses",
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
      <div className="relative w-full">
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
              navStage(ListerStage.EnterBasicInfo);
            }}
            onSkip={() => {
              navStage(ListerStage.EnterBasicInfo);
            }}
          />
        </FadeTransition>
      </div>
    </div>
  );
}
