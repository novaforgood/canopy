import { useState } from "react";
import toast from "react-hot-toast";
import { useInsertAnnouncementMutation } from "../../generated/graphql";
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

const AnnouncementModal = (props: AnnouncementModalProps) => {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [_, insertMutation] = useInsertAnnouncementMutation();

  // rich text editor content
  const [postContentHTML, setPostContentHTML] = useState("");

  return (
    <ActionModal
      isOpen={props.isOpen}
      onClose={props.closeCallback}
      actionText="Post Announcement"
      onAction={async () => {
        const new_announcement = {
          space_id: currentSpace?.id,
          author_profile_id: currentProfile?.id,
          created_at: new Date().toISOString(),
          deleted: false,
          content: postContentHTML,
        };

        await insertMutation({
          object: new_announcement,
        });

        await apiClient
          .post("/api/services/sendAnnouncementEmail", {
            type: "ANNOUNCEMENT",
            payload: {
              space_id: currentSpace?.id,
              space_name: currentSpace?.name,
              announcement_data: {
                timeCreated: new_announcement.created_at,
                contentHTML: new_announcement.content,
                author: {
                  first_name: currentProfile?.user.first_name ?? "",
                  last_name: currentProfile?.user.last_name ?? "",
                  profile_img_url:
                    currentProfile?.profile_listing?.profile_listing_image
                      ?.image.url ?? "",
                },
              },
            },
          })
          .catch((err) => {
            toast.error(err.message);
          });

        console.log("sent");

        props.actionCallback();
      }}
      secondaryActionText="Cancel"
      onSecondaryAction={props.closeCallback}
    >
      <div className="mt-4 flex w-160 flex-col px-8">
        <Text variant="heading4">Start a post in {currentSpace?.name}</Text>

        <div className="h-8"></div>

        <RichTextInput
          onUpdate={({ editor }) => {
            setPostContentHTML(editor.getHTML());
          }}
        />
        <div className="h-8"></div>
      </div>
    </ActionModal>
  );
};

export default AnnouncementModal;
