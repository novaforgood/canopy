import React, { useState } from "react";

import toast from "react-hot-toast";

import {
  Profile_Listing_Constraint,
  Profile_Listing_Update_Column,
  Space_Listing_Question,
  useUpdateUserMutation,
  useUpsertProfileListingMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { Input, Text } from "../atomic";
import { EditButton } from "../common/EditButton";
import { HtmlDisplay } from "../HtmlDisplay";
import { SimpleTextArea } from "../inputs/SimpleTextArea";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

export function EditName() {
  const [firstNameInputValue, setFirstNameInputValue] = useState("");
  const [lastNameInputValue, setLastNameInputValue] = useState("");
  const { userData, refetchUserData } = useUserData();

  const [_, updateUser] = useUpdateUserMutation();

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setFirstNameInputValue(userData?.first_name ?? "");
    setLastNameInputValue(userData?.last_name ?? "");
    setIsOpen(true);
  };

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actionText="Save"
        onAction={async () => {
          if (!userData?.id) {
            toast.error("No user id");
            return;
          }

          await updateUser({
            id: userData.id,
            first_name: firstNameInputValue,
            last_name: lastNameInputValue,
          })
            .then((res) => {
              if (res.error) {
                throw new Error(res.error.message);
              } else {
                toast.success("Saved name");
              }
            })
            .catch((e) => {
              toast.error(e.message);
            });

          refetchUserData();
          setIsOpen(false);
        }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {
          setIsOpen(false);
        }}
      >
        <div className="flex w-96 flex-col p-8 py-16">
          <Text variant="heading4">Name</Text>
          <div className="h-2"></div>
          <Text className="text-gray-700" italic>
            Note: Your name is shared across all directories you are a part of.
          </Text>
          <div className="h-6"></div>
          <TextInput
            label="First name"
            value={firstNameInputValue}
            onValueChange={setFirstNameInputValue}
          />
          <div className="h-4"></div>
          <TextInput
            label="Last name"
            value={lastNameInputValue}
            onValueChange={setLastNameInputValue}
          />
        </div>
      </ActionModal>
      <Text variant="body1">
        <EditButton className="mb-1 ml-1" onClick={openModal} />
      </Text>
    </>
  );
}
