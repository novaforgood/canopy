import { useEffect, useRef, useState } from "react";

import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import {
  useInsertProfileImageMutation,
  useProfileImageQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { uploadImage } from "../../lib/image";
import { Text } from "../atomic";
import { ImageUploader } from "../common/ImageUploader";
import { ActionModal } from "../modals/ActionModal";

export interface EditProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileImageModal(props: EditProfileImageModalProps) {
  const { isOpen, onClose } = props;

  const { currentProfile, refetchCurrentProfile } = useCurrentProfile();

  const [{ data: profileImageData }] = useProfileImageQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const [_, insertProfileImage] = useInsertProfileImageMutation();
  const profileImageUrl =
    profileImageData?.profile_listing_image[0]?.image.url ?? null;

  const editor = useRef<AvatarEditor | null>(null);

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (profileImageUrl && isOpen) {
      setImage(profileImageUrl);
    }
  }, [profileImageUrl, isOpen]);

  return (
    <ActionModal
      isOpen={isOpen}
      actionText={"Save"}
      onClose={onClose}
      onAction={async () => {
        if (!currentProfile) {
          toast.error("Current profile not defined");
          return;
        }

        const imageData =
          editor.current?.getImageScaledToCanvas().toDataURL() ?? null;
        if (!imageData) {
          toast.error("No image selected");
          return;
        }

        // If image exists, upload it
        const res = await uploadImage(imageData).catch((err) => {
          toast.error(err.message);
          return null;
        });
        if (!res) {
          toast.error("Failed to upload image");
          return;
        }

        const imageId = res.data.image.id;
        await insertProfileImage({
          image_id: imageId,
          profile_id: currentProfile.id,
        })
          .then((res) => {
            if (res.error) {
              throw new Error(res.error.message);
            } else {
              toast.success("Profile image updated");
              refetchCurrentProfile();
              onClose();
            }
          })
          .catch((err) => {
            toast.error(err.message);
          });
      }}
      secondaryActionText={"Cancel"}
      onSecondaryAction={onClose}
    >
      <div className="flex flex-col items-center px-8">
        <div className="h-4"></div>
        <Text variant="heading4">Change Profile Image</Text>
        <div className="h-8"></div>

        <ImageUploader
          showZoom
          showRoundedCrop
          imageSrc={image}
          onImageSrcChange={setImage}
          width={300}
          height={300}
          getRef={(ref) => {
            editor.current = ref;
          }}
        />
        <div className="h-8"></div>
      </div>
    </ActionModal>
  );
}
