import React, { useEffect, useRef, useState } from "react";

import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import {
  Profile_Listing_Update_Column,
  useInsertProfileImageMutation,
  useProfileImageQuery,
  useUpsertProfileListingMutation,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useUserData } from "../../hooks/useUserData";
import { apiClient } from "../../lib/apiClient";
import { uploadImage } from "../../lib/image";
import { Input, Text, Textarea } from "../atomic";
import { ImageUploader } from "../common/ImageUploader";
import { TextInput } from "../inputs/TextInput";

import { StageDisplayWrapper } from "./StageDisplayWrapper";

interface EnterNameProps {
  onComplete: (data: { profileImageId: string | null }) => void;
  onSkip: () => void;
}

export function EnterBasicInfo(props: EnterNameProps) {
  const { onComplete, onSkip } = props;

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();

  const [{ data: profileImageData }] = useProfileImageQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });
  const [_, insertProfileImage] = useInsertProfileImageMutation();
  const profileImageUrl =
    profileImageData?.profile_listing_image[0]?.image.url ?? null;

  const [__, upsertProfileListing] = useUpsertProfileListingMutation();

  const editor = useRef<AvatarEditor | null>(null);

  const [image, setImage] = useState<string | null>(null);
  useEffect(() => {
    if (profileImageUrl) {
      setImage(profileImageUrl);
    }
  }, [profileImageUrl]);

  const [headline, setHeadline] = useState("");
  useEffect(() => {
    if (currentProfile?.profile_listing?.headline) {
      setHeadline(currentProfile.profile_listing.headline);
    }
  }, [currentProfile?.profile_listing?.headline]);

  return (
    <StageDisplayWrapper
      title="Basic information"
      onPrimaryAction={async () => {
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
        }

        if (headline) {
          await upsertProfileListing({
            profile_listing: {
              headline,
              profile_id: currentProfile.id,
            },
            update_columns: [Profile_Listing_Update_Column.Headline],
          });
        }

        onComplete({
          profileImageId: "TODO: figure out what to return here",
        });
      }}
      onSecondaryAction={onSkip}
    >
      <div className="flex flex-col items-start">
        <div className="h-8"></div>

        <Text variant="subheading2" className="font-bold text-gray-600">
          Name
        </Text>
        <div className="h-4"></div>
        <Text bold>
          {userData?.first_name} {userData?.last_name}
        </Text>

        <div className="h-8"></div>

        <Text variant="subheading2" className="font-bold text-gray-600">
          Profile photo
        </Text>
        <div className="h-4"></div>
        <ImageUploader
          showRoundedCrop
          showZoom
          imageSrc={image}
          onImageSrcChange={setImage}
          width={300}
          height={300}
          getRef={(ref) => {
            editor.current = ref;
          }}
        />

        <div className="h-8"></div>

        <Text variant="subheading2" className="font-bold text-gray-600">
          Your headline
        </Text>
        <div className="h-2"></div>
        <Text className="text-gray-600">
          How would you describe yourself in a few words?
        </Text>
        <div className="h-6"></div>
        <div className="w-full sm:w-120">
          <TextInput
            value={headline}
            onValueChange={setHeadline}
            characterLimit={100}
            placeholder='Examples: "English Teacher at Taylor Middle School"'
          />
        </div>
      </div>
    </StageDisplayWrapper>
  );
}
