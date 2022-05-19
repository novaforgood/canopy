import React, { ReactNode, useEffect, useState } from "react";

import { useDebouncedValue, useSetState } from "@mantine/hooks";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { StageNavigator } from "../components/StageNavigator";
import { FadeTransition } from "../components/transitions/FadeTransition";
import {
  Space_Listing_Question_Insert_Input,
  useCreateOwnerProfileInNewSpaceMutation,
} from "../generated/graphql";
import { useQueryParam } from "../hooks/useQueryParam";
import { useUpdateQueryParams } from "../hooks/useUpdateQueryParams";
import { useUserData } from "../hooks/useUserData";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function slugifyAndAppendRandomString(name: string) {
  return `${slugify(name)}-${nanoid()}`;
}

function makeReadableError(message: string) {
  if (message.includes("check_name_length")) {
    return "THe name of the space must be between 1 and 50 characters";
  } else {
    return message;
  }
}

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

interface BackButtonProps {
  onClick?: () => void;
}
function BackButton(props: BackButtonProps) {
  const { onClick } = props;
  const router = useRouter();

  return (
    <button
      className="text-gray-600 hover:underline"
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.back();
        }
      }}
    >
      ← Back
    </button>
  );
}

interface StageDisplayWrapperProps {
  children: ReactNode;
  title: string;
}
function StageDisplayWrapper(props: StageDisplayWrapperProps) {
  const { children, title } = props;

  return (
    <div className="py-20 pl-16 flex flex-col justify-between min-h-screen">
      <div>
        <Text variant="heading2">{title}</Text>
        {children}
      </div>
      <div className="flex">
        <Button variant="primary" rounded>
          Save and continue
        </Button>
        <Button variant="secondary">Skip</Button>
      </div>
    </div>
  );
}

function EnterBasicInfo() {
  return (
    <StageDisplayWrapper title="Basic information">
      <div className="flex flex-col"></div>
    </StageDisplayWrapper>
  );
}

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
          <EnterBasicInfo />
        </FadeTransition>
      </div>
    </div>
  );
}
