import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import {
  Space_Listing_Question_Insert_Input,
  useCreateOwnerProfileInNewSpaceMutation,
} from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { useRouter } from "next/router";
import { useQueryParam } from "../hooks/useQueryParam";
import { useUpdateQueryParams } from "../hooks/useUpdateQueryParams";
import { useDebouncedValue, useSetState } from "@mantine/hooks";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import toast from "react-hot-toast";
import { EnterName } from "../components/create-space/EnterName";
import { StageNavigator } from "../components/StageNavigator";
import { EnterSettings } from "../components/create-space/EnterSettings";
import { FadeTransition } from "../components/transitions/FadeTransition";
import { EnterProfileSchema } from "../components/create-space/EnterProfileSchema";

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

enum CreateStage {
  EnterName = "EnterName",
  EnterProfileSchema = "EnterProfileSchema",
  EnterSettings = "EnterSettings",
}

const MAP_STAGE_TO_LABEL: Record<CreateStage, string> = {
  [CreateStage.EnterName]: "Name",
  [CreateStage.EnterProfileSchema]: "Mentor Profiles",
  [CreateStage.EnterSettings]: "Directory Settings",
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

const ALL_CREATE_STAGES = Object.values(CreateStage).map((val) => {
  return {
    value: val,
    label: MAP_STAGE_TO_LABEL[val],
  };
});

type CreateProgramState = {
  enteredStages: CreateStage[];
  spaceName: string;
  spaceSlug: string;
  listingQuestions: Space_Listing_Question_Insert_Input[];
};

const DEFAULT_CREATE_PROGRAM_STATE: CreateProgramState = {
  enteredStages: [CreateStage.EnterName],
  spaceName: "",
  spaceSlug: "",
  listingQuestions: [
    {
      title: "About me",
      char_count: 100,
    },
    {
      title: "You can talk to me about",
      char_count: 100,
    },
  ],
};

export default function CreatePage() {
  const router = useRouter();
  const currentStage = (useQueryParam("stage", "string") ??
    CreateStage.EnterName) as CreateStage;
  const { updateQueryParams } = useUpdateQueryParams();

  const { userData } = useUserData();
  const [_, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const [stageDisplayed, setStageDisplayed] = useState<CreateStage | null>(
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

  const loadedState = LocalStorage.get(
    LocalStorageKey.CreateSpace
  ) as CreateProgramState | null;

  const [state, setState] = useSetState<CreateProgramState>({
    ...DEFAULT_CREATE_PROGRAM_STATE,
    ...loadedState,
  });

  // Update localstorage to match the current state
  const [debouncedState] = useDebouncedValue(state, 400);
  useEffect(() => {
    LocalStorage.set(LocalStorageKey.CreateSpace, debouncedState);
  }, [debouncedState]);

  // Navigate to a stage
  const navStage = (stage: CreateStage) => {
    updateQueryParams({ stage });
    setState((prev) => {
      if (prev.enteredStages.includes(stage)) {
        return prev;
      } else {
        return {
          ...prev,
          enteredStages: [...prev.enteredStages, stage],
        };
      }
    });
  };

  if (!userData) {
    return null;
  }
  return (
    <div className="flex h-screen">
      <div className="bg-gray-50 p-12 pt-40 h-screen flex-none">
        <StageNavigator
          currentStage={currentStage}
          stages={ALL_CREATE_STAGES}
          enabledStages={state.enteredStages}
          onStageClick={(newStage) => {
            navStage(newStage);
          }}
        />
      </div>
      <div className="px-16 py-20 w-full h-full overflow-y-auto">
        <BackButton
          onClick={() => {
            switch (currentStage) {
              case CreateStage.EnterName:
                router.push("/");
                break;
              case CreateStage.EnterProfileSchema:
                navStage(CreateStage.EnterName);
                break;
              case CreateStage.EnterSettings:
                navStage(CreateStage.EnterProfileSchema);
                break;
              default:
                break;
            }
          }}
        />
        <div className="relative w-full">
          <FadeTransition show={stageDisplayed === CreateStage.EnterName}>
            <EnterName
              data={{ spaceName: state.spaceName }}
              onChange={(newData) => {
                const slug = slugifyAndAppendRandomString(newData.spaceName);
                setState({ ...newData, spaceSlug: slug });
              }}
              onComplete={() => {
                navStage(CreateStage.EnterProfileSchema);
              }}
            />
          </FadeTransition>
          <FadeTransition
            show={stageDisplayed === CreateStage.EnterProfileSchema}
          >
            <EnterProfileSchema
              data={{ listingQuestions: state.listingQuestions }}
              onChange={(newData) => {
                setState({ ...newData });
              }}
              onComplete={() => {
                navStage(CreateStage.EnterSettings);
              }}
            />
          </FadeTransition>
          <FadeTransition show={stageDisplayed === CreateStage.EnterSettings}>
            <EnterSettings
              data={{ spaceSlug: state.spaceSlug }}
              onChange={(newData) => {
                setState({ ...newData });
              }}
              onComplete={() => {
                createOwnerProfile({
                  space: {
                    name: state.spaceName,
                    owner_id: userData.id,
                    slug: state.spaceSlug,
                    space_listing_questions: {
                      data: state.listingQuestions.map((question, index) => ({
                        ...question,
                        listing_order: index,
                      })),
                    },
                  },
                  user_id: userData.id,
                }).then((result) => {
                  if (result.error) {
                    const msg = makeReadableError(result.error.message);
                    toast.error(msg);
                  } else {
                    LocalStorage.delete(LocalStorageKey.CreateSpace);
                    router.push(`/space/${state.spaceSlug}`);
                  }
                });
              }}
            />
          </FadeTransition>
        </div>
      </div>
    </div>
  );
}
