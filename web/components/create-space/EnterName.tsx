import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useCreateOwnerProfileInNewSpaceMutation } from "../../generated/graphql";
import { BxCaretDown } from "../../generated/icons/regular";
import { useUserData } from "../../hooks/useUserData";
import { Button, Input, Text, Textarea } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { SimpleRichTextInput } from "../inputs/SimpleRichTextInput";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

const ARRAY_LENGTH_8 = new Array(8).fill(0);

const SPACE_NAME_PLACEHOLDER = "Space Name";

export type EnterNameData = {
  spaceName: string;
  spaceDescription: string;
  coverImage: { id: string; url: string } | null;
};
interface EnterNameProps {
  onComplete: () => void;
  data: EnterNameData;
  onChange: (newData: Partial<EnterNameData>) => void;
}

export function EnterName(props: EnterNameProps) {
  const { onComplete, data, onChange } = props;

  const [description, setDescription] = useState("");
  useEffect(() => {
    onChange({ spaceDescription: description });
  }, [description, onChange]);

  return (
    <div className="flex gap-20 justify-start items-start h-full">
      <div className="flex flex-col items-start justify-between h-full w-full">
        <div className="h-10"></div>
        <Text variant="heading4">What is the name of your community?</Text>
        <div className="h-1"></div>
        <Text variant="body1" className="text-gray-600">
          This will become the name of your directory.
        </Text>
        <div className="h-6"></div>
        <Input
          className="w-120"
          value={data.spaceName}
          onValueChange={(value) => {
            onChange({ spaceName: value });
          }}
          placeholder="Ex. Rainbow Buddies, UCLA SWE, etc."
        />
        <div className="h-24"></div>
        <Text variant="heading4">Tell us about your community.</Text>
        <div className="h-1"></div>
        <Text variant="body1" className="text-gray-600">
          This will become the description on your directory homepage (you can
          change this anytime).
        </Text>
        <div className="h-6"></div>
        <SimpleRichTextInput
          className="w-120"
          value={data.spaceDescription}
          onUpdate={({ editor }) => {
            setDescription(editor.getHTML());
          }}
          characterLimit={300}
          placeholder="Ex. A community of people who love bunnies."
        />
        <div className="h-20"></div>
        <Button
          // disabled={!name}
          rounded
          onClick={() => {
            if (!data.spaceName) {
              toast.error("Please enter a name for your space.");
              return;
            }
            onComplete();
          }}
        >
          Save and continue
        </Button>
      </div>
      <div className="border border-black rounded-md p-4 w-120 mt-12 shrink-0">
        <div className="flex items-center justify-between truncate">
          <Text variant="subheading1" className="animate-pulse p-2 bg-teal-50">
            {data.spaceName || SPACE_NAME_PLACEHOLDER}
          </Text>
          <div className="flex gap-1 items-center">
            <div className="rounded-full bg-gray-700 h-5 w-5"></div>
            <BxCaretDown className="h-5 w-5" />
          </div>
        </div>

        <div className="h-8"></div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1 flex flex-col items-start gap-2 p-2 bg-teal-50 animate-pulse">
            <Text variant="heading4">
              {data.spaceName || SPACE_NAME_PLACEHOLDER}
            </Text>
            <HtmlDisplay html={data.spaceDescription} className="text-xs" />
          </div>
          <SpaceCoverPhoto
            className="flex-1 bg-gray-50"
            src={data.coverImage?.url}
          />
        </div>
        <div className="w-full h-0.5 bg-gray-50 my-8"></div>
        <div className="grid grid-cols-4 gap-4 w-full">
          {ARRAY_LENGTH_8.map((_, idx) => {
            return <div key={idx} className="rounded-md bg-gray-50 h-28" />;
          })}
        </div>
      </div>
    </div>
  );
}
