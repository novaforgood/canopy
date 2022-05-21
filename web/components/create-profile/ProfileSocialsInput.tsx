import React from "react";

import { useDisclosure, useSetState } from "@mantine/hooks";

import { Button, Input, Text } from "../../components/atomic";
import { ActionModal } from "../../components/modals/ActionModal";
import {
  Profile_Listing_Social_Type_Enum,
  useProfileListingSocialsQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";

const ALL_SOCIAL_TYPES = Object.values(Profile_Listing_Social_Type_Enum);

export function ProfileSocialsInput() {
  console.log(ALL_SOCIAL_TYPES);
  const { userData } = useUserData();

  const [opened, handlers] = useDisclosure(false, {
    onOpen: () => {
      console.log("open");
    },
  });

  const { currentProfile } = useCurrentProfile();
  const [{ data: profileListingSocialsData }] = useProfileListingSocialsQuery({
    variables: {
      profile_listing_id: currentProfile?.profile_listing?.id ?? "",
    },
  });

  const [socials, setSocials] = useSetState<Record<string, string>>({});

  return (
    <>
      <div className="grid grid-cols-2 items-center gap-4">
        <Text>Email address</Text>
        <Text className="py-1 px-4 border rounded-md">
          {userData?.email ?? ""}
        </Text>

        <ActionModal
          isOpen={opened}
          onClose={() => {
            handlers.close();
          }}
          actionText="Save"
          onAction={() => {
            handlers.close();
          }}
          secondaryActionText="Cancel"
          onSecondaryAction={() => {
            handlers.close();
          }}
        >
          <div className="grid grid-cols-2 items-center gap-2 p-8 w-120">
            <Text>Email</Text>
            <Text className="py-1 px-4 border rounded-md">
              {userData?.email}
            </Text>
            {ALL_SOCIAL_TYPES.map((socialType) => {
              return (
                <>
                  <Text>{socialType}</Text>
                  <Input
                    value={socials[socialType] ?? ""}
                    onValueChange={(newValue) => {
                      setSocials({
                        [socialType]: newValue,
                      });
                    }}
                  />
                </>
              );
            })}
          </div>
        </ActionModal>
      </div>
      <Button
        onClick={() => {
          handlers.open();
        }}
      >
        Edit
      </Button>
    </>
  );
}
