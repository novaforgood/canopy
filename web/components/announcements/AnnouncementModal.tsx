import { useState } from "react";

import toast from "react-hot-toast";

import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { Text } from "../atomic";
import { RichTextInput } from "../inputs/RichTextInput";
import { ActionModal } from "../modals/ActionModal";

interface AnnouncementModalProps {
  isOpen: boolean;
  closeCallback: () => void;
  actionCallback: () => void;
}

export const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  // rich text editor content
  const [announcementHTML, setAnnouncementHTML] = useState("");

  return (
    <ActionModal
      isOpen={props.isOpen}
      onClose={props.closeCallback}
      actionText="Post Announcement"
      onAction={async () => {
        // TODO: Error toast when announcement message is empty

        // send stuff to endpoint to process the new announcement
        await apiClient
          .post("/api/services/sendAnnouncement", {
            authorProfileId: currentProfile?.id,
            announcementContent: announcementHTML,
          })
          .then(() => {
            toast.success("Announcement Posted!");

            setAnnouncementHTML("");
            props.actionCallback();
          })
          .catch((err) => {
            toast.error(`Error Posting: ${err.message}`);
          });
      }}
      secondaryActionText="Cancel"
      onSecondaryAction={props.closeCallback}
    >
      <div className="mt-4 flex w-160 flex-col px-8">
        <Text variant="heading4">Start a post in {currentSpace?.name}</Text>
        <div className="h-2"></div>
        <Text className="text-gray-700">
          If you post an announcement, an e-mail will be sent notifying all
          members of this directory.
        </Text>

        <div className="h-8"></div>

        <RichTextInput
          initContent={announcementHTML}
          onUpdate={({ editor }) => {
            setAnnouncementHTML(editor.getHTML());
          }}
        />

        <div className="h-8"></div>
      </div>
    </ActionModal>
  );
};
