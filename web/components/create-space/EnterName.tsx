import React from "react";

import toast from "react-hot-toast";

import { Button, Text } from "../atomic";
import { SimpleRichTextInput } from "../inputs/SimpleRichTextInput";
import { TextInput } from "../inputs/TextInput";

import { HomepagePreview } from "./HomepagePreview";

export type EnterNameData = {
  spaceName: string;
  spaceDescription: string;
  coverImage: { id: string; url: string } | null;
};
interface EnterNameProps {
  onComplete: () => void;
  data: EnterNameData;
  onChange: (newData: Partial<EnterNameData>) => void;
  initDescription: string;
}

export function EnterName(props: EnterNameProps) {
  const { onComplete, data, onChange, initDescription } = props;

  return (
    <div className="flex h-full items-start justify-start gap-20">
      <div className="flex h-full w-full flex-col items-start justify-between">
        <div className="h-10"></div>
        <Text variant="heading4">Name your directory. *</Text>
        <div className="h-1"></div>
        <Text variant="body1" className="text-gray-600">
          This will be the title of your homepage.
        </Text>
        <div className="h-6"></div>
        <div className="w-80 2xl:w-120">
          <TextInput
            characterLimit={50}
            value={data.spaceName}
            onValueChange={(value) => {
              onChange({ spaceName: value });
            }}
            placeholder="Ex. Rainbow Buddies, UCLA SWE, etc."
          />
        </div>

        <div className="h-24"></div>
        <Text variant="heading4">Write a description for your directory.</Text>
        <div className="h-1"></div>
        <Text variant="body1" className="text-gray-600">
          Who is in this directory? And how should people use this space?
        </Text>
        <div className="h-6"></div>
        <div className="flex w-full flex-col" style={{ minHeight: 150 }}>
          <SimpleRichTextInput
            initContent={initDescription}
            onUpdate={({ editor }) => {
              onChange({ spaceDescription: editor.getHTML() });
            }}
            characterLimit={300}
            placeholder="Ex. This is a directory of our international peer mentors. Feel free to reach out to any of them with questions about visas, classes, and getting adjusted to life in the U.S"
          />
        </div>

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
      <HomepagePreview
        title={data.spaceName}
        description={data.spaceDescription}
        coverSrc={data.coverImage?.url ?? null}
        titleAndDescriptionFlashing
      />
    </div>
  );
}
