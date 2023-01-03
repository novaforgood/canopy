import { useState } from "react";
import toast from "react-hot-toast";

import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { Text } from "../atomic";
import { ToggleSwitch } from "../atomic/ToggleSwitch";
import { RichTextInput } from "../inputs/RichTextInput";
import { ActionModal } from "../modals/ActionModal";

interface AnnouncementModalProps {
  isOpen: boolean;
  closeCallback: () => void;
  actionCallback: () => void;
}

const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  // rich text editor content
  const [announcementHTML, setAnnouncementHTML] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

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
            sendEmail,
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

        <div className="h-8"></div>

        <RichTextInput
          initContent={announcementHTML}
          onUpdate={({ editor }) => {
            setAnnouncementHTML(editor.getHTML());
          }}
        />

        <div className="mt-6 mb-4 flex flex-row justify-between gap-4">
          <Text variant="subheading2">Send email notification:</Text>
          <ToggleSwitch
            enabled={sendEmail}
            onChange={(val) => setSendEmail(val)}
          />
        </div>
        <div className="h-8"></div>
      </div>
    </ActionModal>
  );
};

export default AnnouncementModal;
