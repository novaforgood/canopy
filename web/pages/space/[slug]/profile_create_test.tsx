import React, { ReactNode, useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";

import { Button, Text } from "../../../components/atomic";
import { ImageUploader } from "../../../components/ImageUploader";
import { SimpleRichTextInput } from "../../../components/inputs/SimpleRichTextInput";
import { StageNavigator } from "../../../components/StageNavigator";
import { FadeTransition } from "../../../components/transitions/FadeTransition";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useQueryParam } from "../../../hooks/useQueryParam";
import { useUpdateQueryParams } from "../../../hooks/useUpdateQueryParams";
import { useUserData } from "../../../hooks/useUserData";
import { LocalStorage, LocalStorageKey } from "../../../lib/localStorage";

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
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}
function StageDisplayWrapper(props: StageDisplayWrapperProps) {
  const {
    children,
    title,
    onPrimaryAction = () => {},
    onSecondaryAction = () => {},
  } = props;

  return (
    <div className="py-20 pl-16 flex flex-col justify-between min-h-screen">
      <div>
        <Text variant="heading2">{title}</Text>
        {children}
      </div>
      <div className="flex">
        <Button variant="primary" rounded onClick={onPrimaryAction}>
          Save and continue
        </Button>
        <Button variant="secondary" onClick={onSecondaryAction}>
          Skip
        </Button>
      </div>
    </div>
  );
}

interface EnterNameProps {
  onComplete: () => void;
  onSkip: () => void;
}

function EnterBasicInfo(props: EnterNameProps) {
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

interface EnterResponsesProps {
  onComplete: () => void;
  onSkip: () => void;
}

function EnterResponses(props: EnterResponsesProps) {
  const { onComplete, onSkip } = props;

  const { currentSpace } = useCurrentSpace();

  // const [{ data: listingResponseData }, refetchListingResponse] =
  //   useListingResponseByQuestionIdQuery({
  //     variables: { question_id: question.id },
  //   });

  const [responses, setResponses] = useSetState<Record<string, string>>({});

  return (
    <StageDisplayWrapper
      title="Responses"
      onPrimaryAction={onComplete}
      onSecondaryAction={onSkip}
    >
      <div className="h-16"></div>
      <div className="flex flex-col items-start">
        {currentSpace?.space_listing_questions.map((question) => {
          const response = responses[question.id] ?? "";

          return (
            <div
              className="flex flex-col items-start mt-4 w-160"
              key={question.id}
            >
              <Text variant="subheading2" className="text-gray-600 font-bold">
                {question.title}
              </Text>
              <div className="h-4"></div>
              <SimpleRichTextInput
                content={response}
                characterLimit={question.char_count}
                onUpdate={({ editor }) => {
                  setResponses({
                    [question.id]: editor.getHTML(),
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </StageDisplayWrapper>
  );
}

interface EnterTagsProps {
  onComplete: () => void;
  onSkip: () => void;
}

function EnterTags(props: EnterTagsProps) {
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

interface EnterContactInfoProps {
  onComplete: () => void;
  onSkip: () => void;
}

function EnterContactInfo(props: EnterContactInfoProps) {
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
          Contact info
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

interface ReviewProps {
  onComplete: () => void;
  onSkip: () => void;
}

function Review(props: ReviewProps) {
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
        <Text variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis
          mattis lorem.
        </Text>
      </div>
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
