import React, { ReactNode, useEffect, useState } from "react";

import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { BackButton } from "../../../components/BackButton";
import { EnterBasicInfo } from "../../../components/create-profile/EnterBasicInfo";
import { EnterContactInfo } from "../../../components/create-profile/EnterContactInfo";
import { EnterResponses } from "../../../components/create-profile/EnterResponses";
import { EnterTags } from "../../../components/create-profile/EnterTags";
import { Review } from "../../../components/create-profile/Review";
import { StepDisplay } from "../../../components/create-profile/StepDisplay";
import { TwoThirdsPageLayout } from "../../../components/layout/TwoThirdsPageLayout";
import { StageNavigator } from "../../../components/StageNavigator";
import { FadeTransition } from "../../../components/transitions/FadeTransition";
import { Profile_Role_Enum } from "../../../generated/graphql";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useQueryParam } from "../../../hooks/useQueryParam";
import { useUpdateQueryParams } from "../../../hooks/useUpdateQueryParams";
import { CustomPage } from "../../../types";

enum ListerStage {
  EnterBasicInfo = "EnterBasicInfo",
  EnterResponses = "EnterResponses",
  EnterTags = "EnterTags",
  EnterContactInfo = "EnterContactInfo",
  Review = "Review",
}

const MAP_STAGE_TO_LABEL: Record<ListerStage, string> = {
  [ListerStage.EnterBasicInfo]: "Your Bio",
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

const ListerOnboardingPage: CustomPage = () => {
  const router = useRouter();
  const currentStage = (useQueryParam("stage", "string") ??
    ListerStage.EnterBasicInfo) as ListerStage;
  const { updateQueryParams } = useUpdateQueryParams();

  const { currentSpace } = useCurrentSpace();
  const { fetchingCurrentProfile, currentProfileHasRole } = useCurrentProfile();

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

  const navBack = () => {
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
      case ListerStage.EnterContactInfo:
        navStage(ListerStage.EnterTags);
        break;
      case ListerStage.Review:
        navStage(ListerStage.EnterContactInfo);
        break;
      default:
        router.back();
    }
  };

  if (fetchingCurrentProfile) {
    return <div>Loading...</div>;
  }

  if (!currentProfileHasRole(Profile_Role_Enum.MemberWhoCanList)) {
    return <div>You do not have profile listing permissions.</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:h-screen">
      <div className="bg-olive-100 p-6 sm:p-12 sm:pt-40 sm:h-screen shrink-0 flex flex-col items-start justify-between">
        <div className="w-full">
          <StageNavigator
            currentStage={currentStage}
            stages={ALL_LISTER_STAGES}
            enabledStages={ALL_LISTER_STAGES.map((s) => s.value)}
            onStageClick={(newStage) => {
              navStage(newStage);
            }}
          />
        </div>
        <div>
          <div className="h-2"></div>
          <BackButton onClick={navBack} />
        </div>
      </div>

      <div className="relative w-full overflow-y-auto bg-gray-50">
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
};

ListerOnboardingPage.showFooter = false;

export default ListerOnboardingPage;
