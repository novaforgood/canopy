import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { EmailType } from "../../common/types";
import { useProfileByIdQuery } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { apiClient } from "../../lib/apiClient";
import { getTimezoneSelectOptions } from "../../lib/timezone";
import { Text, Textarea } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { ActionModal } from "../modals/ActionModal";

export const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface IntroduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
}

export function IntroduceModal(props: IntroduceModalProps) {
  const { isOpen, onClose, profileId } = props;

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const [introMsg, setIntroMsg] = useState("");
  const [avail, setAvail] = useState("");

  const [timezone, setTimezone] = useState<string | null>(defaultTz);

  useEffect(() => {
    if (isOpen) {
      setIntroMsg("");
      setAvail("");
      setTimezone(defaultTz);
    }
  }, [isOpen]);

  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "" },
  });

  if (!profileData?.profile_by_pk) {
    return null;
  }

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        actionText={"Send introduction"}
        onClose={onClose}
        onAction={async () => {
          if (!avail) {
            toast.error("Please enter your availability");
            return;
          }

          if (!currentProfile) {
            toast.error("Please login to send an intro");
            return;
          }

          if (!profileId) {
            toast.error("Please select a profile to send an intro");
            return;
          }

          await apiClient
            .post("/api/services/sendEmail", {
              type: EmailType.Connect,
              payload: {
                senderProfileId: currentProfile.id,
                receiverProfileId: profileId,
                introMessage: introMsg,
                availability: avail,
                timezone,
              },
            })
            .then(() => {
              toast.success("Intro sent!");
              onClose();
            })
            .catch((err) => {
              toast.error(err.message);
            });
        }}
        actionDisabled={!avail || !timezone}
        secondaryActionText={"Cancel"}
        onSecondaryAction={onClose}
      >
        <div className="px-16 pt-8">
          <div className="flex w-96 flex-col items-center ">
            <Text variant="heading4">{`Let's introduce you to ${profileData.profile_by_pk.user.first_name}`}</Text>
            <div className="h-4"></div>
            <Text className="text-center text-gray-600" variant="body2">
              {"We'll"} send an email to{" "}
              {profileData.profile_by_pk.user.first_name}, as well as you at{" "}
              <Text variant="body2" className="text-black">
                {userData?.email}
              </Text>
              .
            </Text>
            <div className="h-8"></div>

            <div className="flex w-96 flex-col gap-8">
              <div className="flex w-full flex-col">
                <Text className="mb-2 text-gray-600">
                  Optional intro message
                </Text>
                <Textarea
                  minRows={4}
                  value={introMsg}
                  onValueChange={setIntroMsg}
                  placeholder="Example: Hi, I’m Billy! I am a Student at Taylor Middle School. Would you be free for a 30 minute chat about dinosaurs? Thank you for your consideration. "
                />
              </div>
              <div className="flex w-full flex-col">
                <Text className="mb-2 text-gray-600">
                  Please add your general availability*
                </Text>
                <Textarea
                  value={avail}
                  onValueChange={setAvail}
                  placeholder="Example: Monday and Tuesday nights after 7pm. All day Saturday and Sunday."
                ></Textarea>
              </div>
              <div className="flex w-full flex-col items-start">
                <Text className="mb-2 text-gray-600">
                  Please select your timezone*
                </Text>
                <SelectAutocomplete
                  options={getTimezoneSelectOptions()}
                  value={timezone}
                  onSelect={setTimezone}
                  className="w-96"
                />
              </div>
            </div>
          </div>
          <div className="h-16"></div>
        </div>
      </ActionModal>
    </>
  );
}
