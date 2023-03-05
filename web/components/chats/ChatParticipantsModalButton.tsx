import { useDisclosure } from "@mantine/hooks";

import { BxInfoCircle } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useQueryParam } from "../../hooks/useQueryParam";
import { Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { ProfileImage } from "../common/ProfileImage";
import { ActionModal } from "../modals/ActionModal";

import { ChatParticipant } from "./utils";

interface ChatParticipantsModalButtonProps {
  chatParticipants: ChatParticipant[];
}

export function ChatParticipantsModalButton(
  props: ChatParticipantsModalButtonProps
) {
  const { chatParticipants } = props;

  const { currentProfile } = useCurrentProfile();
  const spaceSlug = useQueryParam("slug", "string");
  const [open, handlers] = useDisclosure(false);

  return (
    <>
      <IconButton
        icon={<BxInfoCircle className="h-5 w-5 cursor-pointer text-gray-500" />}
        onClick={handlers.open}
        className="rounded-full"
      />

      <ActionModal
        isOpen={open}
        onClose={handlers.close}
        actionText="Close"
        onAction={handlers.close}
      >
        <div className="flex flex-col rounded-md bg-white px-8 py-8">
          <div className="w-96"></div>
          <Text variant="subheading1" className="mx-auto">
            People in this chat
          </Text>
          <div className="h-8"></div>
          <div className="flex flex-col gap-3">
            {chatParticipants.map((p) => (
              <div
                className="flex items-center justify-between"
                key={p.profileId}
              >
                <div className="flex items-center gap-2">
                  <ProfileImage
                    className="h-10 w-10"
                    src={p.profileImage?.url}
                  />
                  <Text variant="body1">{p.fullName}</Text>
                </div>
                {p.profileId === currentProfile?.id ? (
                  <Text variant="body1" className="text-gray-500">
                    You
                  </Text>
                ) : (
                  <a
                    href={`/space/${spaceSlug}/profile/${p.profileId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Text className="text-gray-500 hover:underline">
                      View Profile
                    </Text>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </ActionModal>
    </>
  );
}
