import { useEffect, useRef, useState } from "react";

import { useDisclosure } from "@mantine/hooks";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import {
  Profile_Role_Enum,
  useInsertProfileImageMutation,
  useProfileImageQuery,
} from "../generated/graphql";
import { BxsPencil } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";
import { uploadImage } from "../lib/image";

import { Button, Text } from "./atomic";
import { EditResponse } from "./edit-profile/EditResponse";
import { ProfileSocialsDisplay } from "./edit-socials-info/ProfileSocialsDisplay";
import { ProfileSocialsModal } from "./edit-socials-info/ProfileSocialsModal";
import { EditButton } from "./EditButton";
import { ImageUploader } from "./ImageUploader";
import { ActionModal } from "./modals/ActionModal";
import { ProfileImage } from "./ProfileImage";
import PublishedToggleSwitch from "./PublishedToggleSwitch";

interface EditProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function EditProfileImageModal(props: EditProfileImageModalProps) {
  const { isOpen, onClose } = props;

  const { currentProfile } = useCurrentProfile();

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

function EditProfileImage() {
  const { currentProfile } = useCurrentProfile();

  const [{ data: profileImageData }] = useProfileImageQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const [opened, handlers] = useDisclosure(false);

  const profileImageUrl =
    profileImageData?.profile_listing_image[0]?.image.url ?? null;

  return (
    <>
      <div className="h-40 w-40 rounded-full relative">
        <ProfileImage className="h-40 w-40" src={profileImageUrl} />
        <button
          onClick={handlers.open}
          className="absolute top-0 left-0 h-full w-full rounded-full bg-black/50 text-white/80 
          opacity-0 hover:opacity-100 transition flex items-center p-2 text-center"
        >
          <Text>Change Profile Image</Text>
        </button>
      </div>
      <EditProfileImageModal isOpen={opened} onClose={handlers.close} />
    </>
  );
}
export function EditProfileListing() {
  const { currentProfile, currentProfileHasRole } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const { userData } = useUserData();

  const [socialsOpened, socialsHandlers] = useDisclosure(false);

  if (!currentProfileHasRole(Profile_Role_Enum.MemberWhoCanList)) {
    return <div>You do not have profile listing permissions.</div>;
  }
  if (!currentProfile || !currentSpace) {
    return <div>Either profile or space is null</div>;
  }

  const { first_name, last_name, email, id } = currentProfile.user;

  return (
    <div className="">
      <PublishedToggleSwitch
        profileListingId={currentProfile.profile_listing?.id ?? ""}
      />
      <div className="h-4"></div>
      <div className="max-w-3xl border border-black rounded-lg w-full flex flex-col pb-12">
        <div className="h-20 bg-gray-100 rounded-t-lg"></div>
        <div className="px-12 -mt-4">
          <div className="flex items-center gap-12">
            <EditProfileImage />
            <div className="flex flex-col mt-4">
              <Text variant="heading4">
                {first_name} {last_name}
              </Text>
              <div className="h-1"></div>
              <Text variant="body1">
                Hello! This is my profile summary or bio.
              </Text>
            </div>
          </div>
          <div className="h-16"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {currentSpace.space_listing_questions.map((question) => {
                return <EditResponse key={question.id} question={question} />;
              })}
            </div>
            <div>
              <div className="h-24 bg-gray-50 p-4 rounded-md">Tags go here</div>
              <div className="h-8"></div>
              <div className="bg-gray-50 p-4 rounded-md">
                <Text variant="subheading1">
                  Contact me
                  <EditButton
                    className="mb-1 ml-1"
                    onClick={socialsHandlers.open}
                  />
                </Text>
                <div className="h-4"></div>
                <Text>Need some help? {"We'll"} introduce you.</Text>
                <div className="h-4"></div>
                <Button disabled rounded>
                  Introduce me
                </Button>
                <div className="h-8"></div>
                <ProfileSocialsDisplay
                  profileListingId={currentProfile.profile_listing?.id ?? ""}
                  email={userData?.email}
                />
                <ProfileSocialsModal
                  isOpen={socialsOpened}
                  onClose={socialsHandlers.close}
                />

                <div className="flex"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
