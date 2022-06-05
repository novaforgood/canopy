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
import { ImageUploader } from "../ImageUploader";
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
    if (profileImageUrl) {
      setImage(profileImageUrl);
    }
  }, [profileImageUrl]);

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

        // If image exists, upload it
        if (imageData) {
          const res = await uploadImage(imageData).catch((err) => {
            toast.error(err.message);
            return null;
          });
          if (!res) return;

          const imageId = res.data.image.id;
          await insertProfileImage({
            image_id: imageId,
            profile_id: currentProfile.id,
          });
          refetchCurrentProfile();
          onClose();
        } else {
          toast.error("No image selected");
        }
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
