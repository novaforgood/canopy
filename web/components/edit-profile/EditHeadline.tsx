import React, { useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Listing_Question,
  useUpsertProfileListingMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Input, Text } from "../atomic";
import { EditButton } from "../EditButton";
import { HtmlDisplay } from "../HtmlDisplay";
import { SimpleTextArea } from "../inputs/SimpleTextArea";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

export function EditHeadline() {
  const { currentProfile, refetchCurrentProfile } = useCurrentProfile();

  const [headlineInputValue, setHeadlineInputValue] = useState("");

  const [__, upsertProfileListing] = useUpsertProfileListingMutation();

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
          await upsertProfileListing({
            profile_listing: {
              headline: headlineInputValue,
              profile_id: currentProfile?.id ?? "",
            },
            update_columns: [Profile_Listing_Update_Column.Headline],
          })
            .then((res) => {
              if (res.error) {
                throw new Error(res.error.message);
              } else {
                toast.success("Saved headline");
              }
            })
            .catch((e) => {
              toast.error(e.message);
            });

          refetchCurrentProfile();
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="flex w-96 flex-col p-8 py-16">
          <Text variant="heading4">Headline</Text>
          <div className="h-4"></div>
          <SimpleTextArea
            characterLimit={100}
            value={headlineInputValue}
            onValueChange={setHeadlineInputValue}
          />
        </div>
      </ActionModal>
      <Text variant="body1">
        {currentProfile?.profile_listing?.headline ?? (
          <Text className="text-gray-600">Add a headline</Text>
        )}
        <EditButton className="mb-1 ml-1" onClick={openModal} />
      </Text>
    </>
  );
}
