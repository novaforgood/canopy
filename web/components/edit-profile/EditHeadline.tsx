import React, { useState } from "react";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Listing_Question,
  useUpdateListingHeadlineMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Input, Text } from "../atomic";
import { EditButton } from "../EditButton";
import { HtmlDisplay } from "../HtmlDisplay";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

export function EditHeadline() {
  const { currentProfile, refetchCurrentProfile } = useCurrentProfile();

  const [headlineInputValue, setHeadlineInputValue] = useState("");

  const [_, updateListingHeadline] = useUpdateListingHeadlineMutation();

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setHeadlineInputValue(currentProfile?.profile_listing?.headline ?? "");
    setIsOpen(true);
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={async () => {
          await updateListingHeadline({
            profile_id: currentProfile?.id ?? "",
            headline: headlineInputValue,
          });

          refetchCurrentProfile();
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="p-8 py-16 w-96 flex flex-col">
          <Text variant="heading4">Headline</Text>
          <div className="h-4"></div>
          <TextInput
            characterLimit={100}
            value={headlineInputValue}
            onValueChange={setHeadlineInputValue}
          />
        </div>
      </ActionModal>
      <Text variant="body1">
        {currentProfile?.profile_listing?.headline}
        <EditButton className="mb-1 ml-1" onClick={openModal} />
      </Text>
    </>
  );
}
