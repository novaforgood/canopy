import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useCreateOwnerProfileInNewSpaceMutation } from "../../generated/graphql";
import { BxCaretDown } from "../../generated/icons/regular";
import { useUserData } from "../../hooks/useUserData";
import { Button, Input, Text, Textarea } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { SimpleRichTextInput } from "../inputs/SimpleRichTextInput";
import { TextInput } from "../inputs/TextInput";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

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
    <div className="flex gap-20 justify-start items-start h-full">
      <div className="flex flex-col items-start justify-between h-full w-full">
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
        <div className="w-full flex flex-col" style={{ minHeight: 150 }}>
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
