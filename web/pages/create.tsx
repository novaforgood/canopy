import React, {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { customAlphabet } from "nanoid";
import { Button, Input, Text } from "../components/atomic";
import {
  Space_Listing_Question_Insert_Input,
  useCreateOwnerProfileInNewSpaceMutation,
} from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { useRouter } from "next/router";
import { useQueryParam } from "../hooks/useQueryParam";
import classNames from "classnames";
import { useUpdateQueryParams } from "../hooks/useUpdateQueryParams";
import { useDebouncedValue, useSetState } from "@mantine/hooks";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import { Transition } from "@headlessui/react";
import {
  ActionModal,
  ActionModalProps,
} from "../components/modals/ActionModal";
import toast from "react-hot-toast";

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

type EditQuestionProps = {
  question: Space_Listing_Question_Insert_Input;
  onSave?: (question: Space_Listing_Question_Insert_Input) => void;
};
function EditQuestion(props: EditQuestionProps) {
  const { question, onSave = () => {} } = props;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(question.title ?? "");
      setCharCount(question.char_count ?? 0);
    }
  }, [isOpen, question.char_count, question.title]);

  const [title, setTitle] = useState(question.title ?? "");
  const [charCount, setCharCount] = useState(question.char_count ?? 0);

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={() => {
          onSave({
            ...question,
            title,
            char_count: charCount,
          });
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mb-4"
          />
          <Input
            value={charCount?.toString()}
            type="number"
            onChange={(e) => setCharCount(parseInt(e.target.value))}
            placeholder="Character Count"
            className="mb-4"
          />
        </div>
      </ActionModal>
      <div
        className="flex flex-col pb-16 hover:ring cursor-pointer"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Text variant="subheading1">
          {question.title} ({question.char_count} chars)
        </Text>
        <div className="h-2"></div>
        <Text variant="body1" className="text-gray-600">
          Your community members will write their responses here.
        </Text>
      </div>
    </>
  );
}

type EnterProfileSchemaData = {
  listingQuestions: Space_Listing_Question_Insert_Input[];
};

type AddSectionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function AddSectionButton(props: AddSectionButtonProps) {
  return (
    <button
      {...props}
      className="bg-gray-50 active:translate-y-px hover:brightness-95 py-2 text-center w-full rounded-md text-gray-700"
    >
      + Add Section
    </button>
  );
}

interface EnterProfileSchemaProps {
  onComplete: () => void;
  onChange: (data: EnterProfileSchemaData) => void;
  data: EnterProfileSchemaData;
}

function EnterProfileSchema(props: EnterProfileSchemaProps) {
  const { onComplete, data, onChange } = props;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Edit profile page format</Text>
      <div className="h-2"></div>
      <Text variant="subheading2" bold className="text-gray-600">
        Community member profiles will follow this format.
      </Text>
      <div className="h-8"></div>
      <div className="max-w-3xl border border-black rounded-lg w-full flex flex-col pb-12">
        <div className="h-20 bg-gray-100 rounded-t-lg"></div>
        <div className="px-12 -mt-4">
          <div className="flex items-center gap-12">
            <div className="rounded-full h-32 w-32 bg-gray-400"></div>
            <div className="flex flex-col mt-4">
              <Text variant="heading4">Member Name</Text>
              <div className="h-1"></div>
              <Text variant="body1">
                Hello! This is my profile summary or bio.
              </Text>
            </div>
          </div>
          <div className="h-16"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {data.listingQuestions.map((question, index) => {
                return (
                  <EditQuestion
                    question={question}
                    onSave={(newQuestion) => {
                      onChange({
                        listingQuestions: [
                          ...data.listingQuestions.slice(0, index),
                          newQuestion,
                          ...data.listingQuestions.slice(index + 1),
                        ],
                      });
                    }}
                    key={index}
                  />
                );
              })}
              <AddSectionButton />
            </div>
            <div>
              <div className="h-24 bg-gray-50 p-4 rounded-md">Tags go here</div>
              <div className="h-2"></div>
              <AddSectionButton />
            </div>
          </div>
        </div>
      </div>

      <div className="h-12"></div>
      <Button
        // disabled={!name}
        rounded
        onClick={() => {
          onComplete();
        }}
      >
        Save and continue
      </Button>
    </div>
  );
}

type EnterNameData = {
  spaceName: string;
};
interface EnterNameProps {
  onComplete: () => void;
  data: EnterNameData;
  onChange: (newData: EnterNameData) => void;
}
function EnterName(props: EnterNameProps) {
  const { onComplete, data, onChange } = props;

  const [_, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { userData } = useUserData();

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">What is the name of your community?</Text>
      <div className="h-2"></div>
      <Text variant="subheading2" bold className="text-gray-600">
        This will become the name of your directory.
      </Text>
      <div className="h-8"></div>
      <Input
        className="w-120"
        value={data.spaceName}
        onValueChange={(value) => {
          onChange({ ...data, spaceName: value });
          setError(null);
        }}
        placeholder="Ex. Rainbow Buddies, UCLA SWE, etc."
      />
      {error && <div className="text-red-500">{error}</div>}
      <div className="h-20"></div>
      <Button
        // disabled={!name}
        rounded
        onClick={() => {
          onComplete();
          // if (!userData?.id) {
          //   return;
          // }

          // const generatedSlug = slugifyAndAppendRandomString(name);
          // createOwnerProfile({
          //   space: {
          //     name,
          //     owner_id: userData.id,
          //     slug: generatedSlug,
          //   },
          //   user_id: userData.id,
          // }).then((result) => {
          //   if (result.error) {
          //     const msg = makeReadableError(result.error.message);
          //     setError(msg);
          //   } else {
          //     router.push(`/space/${generatedSlug}`);
          //   }
          // });
        }}
      >
        Save and continue
      </Button>
    </div>
  );
}

const ALL_CREATE_STAGES = Object.values(CreateStage).map((val) => {
  return {
    value: val,
    label: MAP_STAGE_TO_LABEL[val],
  };
});

interface StageNavigatorProps<TStageEnum> {
  currentStage: TStageEnum;
  stages: {
    value: TStageEnum;
    label: string;
  }[];
  enabledStages?: TStageEnum[];
  onStageClick?: (stage: TStageEnum) => void;
}
function StageNavigator<TStageEnum extends string>(
  props: StageNavigatorProps<TStageEnum>
) {
  const {
    currentStage,
    stages,
    onStageClick = () => {},
    enabledStages = [],
  } = props;

  const [hoveredStage, setHoveredStage] = useState<TStageEnum | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full text-gray-700">
      {stages.map(({ value, label }, idx) => {
        const isCurrent = value === currentStage;
        const isHovered = hoveredStage === value;
        const disabled = !enabledStages.includes(value);

        const cardStyles = classNames({
          "flex w-full items-center border-2 transition": true,
          "cursor-pointer bg-white": !disabled,
          "pointer-events-none bg-gray-50": disabled,
          "border-gray-300": !isCurrent && !isHovered,
          "border-gray-900": !isCurrent && isHovered,
          "border-black": isCurrent,
        });

        const labelStyles = classNames({
          "px-6 py-3 border-l-2 transition": true,
          "border-gray-300": !isCurrent && !isHovered,
          "border-gray-900": !isCurrent && isHovered,
          "border-black": isCurrent,
        });

        return (
          <div
            className={cardStyles}
            key={value}
            onClick={() => {
              if (disabled) return;
              onStageClick(value);
            }}
            onMouseEnter={() => {
              if (disabled) return;
              setHoveredStage(value);
            }}
            onMouseLeave={() => {
              if (disabled) return;
              setHoveredStage(null);
            }}
          >
            <div className="w-14 flex justify-center items-center">
              {idx + 1}
            </div>
            <div className={labelStyles}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

type EnterSettingsData = {
  spaceSlug: string;
};
interface EnterSettingsProps {
  onComplete: () => void;
  data: EnterSettingsData;
  onChange: (newData: EnterSettingsData) => void;
}

function EnterSettings(props: EnterSettingsProps) {
  const { onComplete = () => {}, data, onChange = () => {} } = props;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="h-10"></div>
      <Text variant="heading3">Directory Settings</Text>
      <div className="h-10"></div>
      <Input
        className="w-96"
        value={data.spaceSlug}
        onValueChange={(newVal) => {
          onChange({ ...data, spaceSlug: newVal });
        }}
      />
      <div className="h-12"></div>
      <Button
        // disabled={!name}
        floating
        rounded
        onClick={() => {
          onComplete();
        }}
      >
        Save and continue
      </Button>
    </div>
  );
}

interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
}
function FadeTransition(props: FadeTransitionProps) {
  const { show, children } = props;

  return (
    <Transition
      show={show}
      className="w-full"
      enter="transition-all duration-700"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  );
}

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
