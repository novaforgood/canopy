import React, { useCallback, useEffect, useState } from "react";

import { useDebouncedValue, useInterval } from "@mantine/hooks";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { EnterCoverPhoto } from "../components/create-space/EnterCoverPhoto";
import { EnterName, EnterNameData } from "../components/create-space/EnterName";
import { EnterProfileSchema } from "../components/create-space/EnterProfileSchema";
import { EnterSettings } from "../components/create-space/EnterSettings";
import { StageNavigator } from "../components/StageNavigator";
import { FadeTransition } from "../components/transitions/FadeTransition";
import {
  Space_Listing_Question_Insert_Input,
  useCreateOwnerProfileInNewSpaceMutation,
  Space_Tag_Category_Insert_Input,
} from "../generated/graphql";
import { useQueryParam } from "../hooks/useQueryParam";
import { useUpdateQueryParams } from "../hooks/useUpdateQueryParams";
import { useUserData } from "../hooks/useUserData";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import { CustomPage } from "../types";

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
  EnterCoverPhoto = "EnterCoverPhoto",
  EnterProfileSchema = "EnterProfileSchema",
  EnterSettings = "EnterSettings",
}

const MAP_STAGE_TO_LABEL: Record<CreateStage, string> = {
  [CreateStage.EnterName]: "Name",
  [CreateStage.EnterCoverPhoto]: "Cover Photo",
  [CreateStage.EnterProfileSchema]: "Directory Profiles",
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
  lastSavedTime?: number;
  enteredStages: CreateStage[];
  spaceName: string;
  spaceDescription: string;
  spaceSlug: string;
  coverImage: { id: string; url: string } | null;
  listingQuestions: Space_Listing_Question_Insert_Input[];
  tagCategories: Space_Tag_Category_Insert_Input[];
};

const DEFAULT_CREATE_PROGRAM_STATE: CreateProgramState = {
  lastSavedTime: 0,
  enteredStages: [CreateStage.EnterName],
  spaceName: "",
  spaceDescription: "",
  spaceSlug: "",
  coverImage: null,
  listingQuestions: [
    {
      title: "About me",
      char_count: 250,
      deleted: false,
    },
    {
      title: "You can talk to me about",
      char_count: 250,
      deleted: false,
    },
  ],
  tagCategories: [
    {
      title: "Major",
      deleted: false,
      space_tags: {
        data: [{ label: "Economics", deleted: false }],
      },
    },
  ],
};

const CreatePage: CustomPage = () => {
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

  const [state, setState] = useState<CreateProgramState>({
    ...DEFAULT_CREATE_PROGRAM_STATE,
  });

  const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);
  const [initDescription, setInitDescription] = useState("");
  useEffect(() => {
    const loadedState = LocalStorage.get(
      LocalStorageKey.CreateSpace
    ) as CreateProgramState | null;

    if (loadedState) {
      // If less than 10 seconds after last saved (e.g. the user refreshed)
      if (
        loadedState.lastSavedTime &&
        Date.now() - loadedState.lastSavedTime < 1000 * 10
      ) {
        setState((prev) => ({ ...prev, ...loadedState }));
        setInitDescription(loadedState.spaceDescription);
      }
    }
    setLoadedFromLocalStorage(true);
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (!loadedFromLocalStorage) return;
    LocalStorage.set(LocalStorageKey.CreateSpace, {
      ...state,
      lastSavedTime: Date.now(),
    });
  }, [loadedFromLocalStorage, state]);

  // Update localstorage to match the current state every 2 seconds
  useEffect(() => {
    const interval = setInterval(saveToLocalStorage, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [saveToLocalStorage]);

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

  const handleEnterNameChange = useCallback(
    (newData: Partial<EnterNameData>) => {
      const newSlug = newData.spaceName
        ? { spaceSlug: slugifyAndAppendRandomString(newData.spaceName) }
        : {};
      setState((prev) => ({ ...prev, ...newData, ...newSlug }));
    },
    []
  );

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
      <div className="px-16 py-20 w-full h-screen flex flex-col items-start overflow-y-auto">
        <BackButton
          onClick={() => {
            switch (currentStage) {
              case CreateStage.EnterName:
                router.push("/");
                break;
              case CreateStage.EnterCoverPhoto:
                navStage(CreateStage.EnterName);
                break;
              case CreateStage.EnterProfileSchema:
                navStage(CreateStage.EnterCoverPhoto);
                break;
              case CreateStage.EnterSettings:
                navStage(CreateStage.EnterProfileSchema);
                break;
              default:
                break;
            }
          }}
        />
        <div className="relative w-full h-full">
          <FadeTransition show={stageDisplayed === CreateStage.EnterName}>
            <EnterName
              initDescription={initDescription}
              data={{
                coverImage: state.coverImage,
                spaceName: state.spaceName,
                spaceDescription: state.spaceDescription,
              }}
              onChange={handleEnterNameChange}
              onComplete={() => {
                navStage(CreateStage.EnterCoverPhoto);
              }}
            />
          </FadeTransition>
          <FadeTransition show={stageDisplayed === CreateStage.EnterCoverPhoto}>
            <EnterCoverPhoto
              onComplete={() => {
                navStage(CreateStage.EnterProfileSchema);
              }}
              onChange={(newData) => {
                setState((prev) => ({ ...prev, ...newData }));
              }}
              data={{
                coverImage: state.coverImage,
                spaceName: state.spaceName,
                spaceDescription: state.spaceDescription,
              }}
            />
          </FadeTransition>
          <FadeTransition
            show={stageDisplayed === CreateStage.EnterProfileSchema}
          >
            <EnterProfileSchema
              data={{
                listingQuestions: state.listingQuestions,
                tagCategories: state.tagCategories,
              }}
              onChange={(newData) => {
                setState((prev) => ({ ...prev, ...newData }));
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
                setState((prev) => ({ ...prev, ...newData }));
              }}
              onComplete={async () => {
                createOwnerProfile({
                  space: {
                    name: state.spaceName,
                    description_html: state.spaceDescription ?? undefined,
                    owner_id: userData.id,
                    slug: state.spaceSlug,
                    space_listing_questions: {
                      data: state.listingQuestions.map((question, index) => ({
                        ...question,
                        listing_order: index,
                      })),
                    },

                    space_cover_image: state.coverImage
                      ? {
                          data: { image_id: state.coverImage.id },
                        }
                      : undefined,
                    space_tag_categories: {
                      data: state.tagCategories.map((question, index) => ({
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
};

export default CreatePage;
