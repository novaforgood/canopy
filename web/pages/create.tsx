import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { useCreateOwnerProfileInNewSpaceMutation } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { useRouter } from "next/router";
import { useQueryParam } from "../hooks/useQueryParam";
import classNames from "classnames";

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
  EnterHomepagePhoto = "EnterHomepagePhoto",
  EnterProfileSchema = "EnterProfileSchema",
  EnterSettings = "EnterSettings",
}

const MAP_STAGE_TO_LABEL: Record<CreateStage, string> = {
  [CreateStage.EnterName]: "Name",
  [CreateStage.EnterHomepagePhoto]: "Homepage Photo",
  [CreateStage.EnterProfileSchema]: "Mentor Profiles",
  [CreateStage.EnterSettings]: "Directory Settings",
};

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
  onStageClick?: (stage: TStageEnum) => void;
}
function StageNavigator<TStageEnum extends string>(
  props: StageNavigatorProps<TStageEnum>
) {
  const { currentStage, stages, onStageClick = () => {} } = props;

  const [hoveredStage, setHoveredStage] = useState<TStageEnum | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full text-gray-700">
      {stages.map(({ value, label }, idx) => {
        const isCurrent = value === currentStage;
        const isHovered = hoveredStage === value;

        const cardStyles = classNames({
          "bg-white flex w-full items-center border-2 transition cursor-pointer":
            true,
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
              onStageClick(value);
            }}
            onMouseEnter={() => {
              setHoveredStage(value);
            }}
            onMouseLeave={() => {
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

export default function CreatePage() {
  const [_, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { userData } = useUserData();
  const [name, setName] = useState("");

  const currentStage =
    useQueryParam("stage", "string") || CreateStage.EnterName;

  return (
    <div className="flex h-screen">
      <div className="bg-gray-50 p-12 pt-40 h-screen">
        <StageNavigator
          currentStage={currentStage}
          stages={ALL_CREATE_STAGES}
          onStageClick={(newStage) => {
            router.push({
              pathname: "/create",
              query: {
                stage: newStage,
              },
            });
          }}
        />
      </div>
      <div>
        <div className="text-xl">Create a space!</div>
        <div className="h-4"></div>
        <Input
          value={name}
          onValueChange={(value) => {
            setName(value);
            setError(null);
          }}
          placeholder="Name of your new space"
        />
        {error && <div className="text-red-500">{error}</div>}
        <div className="h-4"></div>
        <Button
          // disabled={!name}
          onClick={() => {
            if (!userData?.id) {
              return;
            }

            const generatedSlug = slugifyAndAppendRandomString(name);
            createOwnerProfile({
              space: {
                name,
                owner_id: userData.id,
                slug: generatedSlug,
              },
              user_id: userData.id,
            }).then((result) => {
              if (result.error) {
                const msg = makeReadableError(result.error.message);
                setError(msg);
              } else {
                router.push(`/space/${generatedSlug}`);
              }
            });
          }}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
