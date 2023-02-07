import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useQueryParam } from "../../hooks/useQueryParam";
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

  const template = useQueryParam("template", "string");

  useEffect(() => {
    console.log(announcementHTML);
  }, [announcementHTML]);
  useEffect(() => {
    if (!currentSpace) return;

    if (template === "chat-intros") {
      const settingsUrl = `${window.location.origin}/space/${currentSpace?.slug}/account/settings`;
      // Announcement should say the admin plans to set up chat intros soon, explain what a chat intro is, and urge people to opt in through the settings.
      // A chat intro essentially matches people into group chats with a conversation starter to get the conversation going.
      setAnnouncementHTML(
        `<p>Hi everyone,</p><p>I'm excited to announce that we're going to be setting up Canopy Intros soon. This is a great way to get to know people in the community and make new friends!</p><p>Intros will match interested members into small group chats with a question to get the conversation going. If you're interested in participating, you can opt in through your account settings:</p><p><a href=${settingsUrl}>${settingsUrl}</a></p>`
      );
    }
  }, [currentSpace, template]);

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
