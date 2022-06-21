import React, { useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "@mantine/hooks";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import { BxsCloudUpload } from "../../generated/icons/solid";
import { uploadImage } from "../../lib/image";
import { Button, Input, Text } from "../atomic";
import { ImageUploader } from "../ImageUploader";

import { HomepagePreview } from "./HomepagePreview";

type EnterCoverPhotoData = {
  coverImage: { id: string; url: string } | null;
  spaceName: string;
  spaceDescription: string;
};
interface EnterCoverPhotoProps {
  onComplete: () => void;
  data: EnterCoverPhotoData;
  onChange: (newData: Partial<EnterCoverPhotoData>) => void;
}

export function EnterCoverPhoto(props: EnterCoverPhotoProps) {
  const { onComplete = () => {}, data, onChange = () => {} } = props;

  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  useEffect(() => {
    if (data.coverImage) {
      setImageSrc(data.coverImage.url);
    }
  }, [data.coverImage]);

  const editor = useRef<AvatarEditor | null>(null);

  const [loadingComplete, setLoadingComplete] = useState(false);

  const [dimensions, setDimensions] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [debouncedDimensions] = useDebouncedValue(dimensions, 200, {
    leading: true,
  });
  useEffect(() => {
    const imageData =
      editor.current?.getImageScaledToCanvas().toDataURL() ?? null;
    setImageData(imageData);
  }, [debouncedDimensions, imageSrc]);

  return (
    <div className="flex gap-20 justify-start items-start h-full">
      <div className="flex flex-col items-start w-full">
        <div className="h-10"></div>
        <Text variant="heading3">
          Upload a homepage picture for your directory.
        </Text>
        <div className="h-2"></div>
        <Text variant="subheading2" className="text-gray-600">
          This can be anything that represents this {"directory's"} community,
          such as a logo or a picture of community members
        </Text>
        <div className="h-8"></div>
        <ImageUploader
          scaleWidth
          imageSrc={imageSrc}
          onImageSrcChange={setImageSrc}
          height={450}
          width={600}
          showZoom
          renderUploadIcon={() => (
            <BxsCloudUpload className="text-gray-500 h-32 w-32 -mb-2" />
          )}
          getRef={(ref) => {
            editor.current = ref;
          }}
          onLoadSuccess={() => {
            setDimensions("loadsuccess");
          }}
          onPositionChange={(position) => {
            setDimensions(`${position.x}, ${position.y}`);
          }}
          onScaleChange={(scale) => {
            setDimensions(`${scale}`);
          }}
        />
        <div className="h-12"></div>
        <div className="flex items-center">
          <Button
            // disabled={!name}
            rounded
            loading={loadingComplete}
            onClick={async () => {
              setLoadingComplete(true);
              // Save image if it's changed

              if (imageData) {
                const res = await uploadImage(imageData).catch((err) => {
                  toast.error(err.message);
                  return null;
                });
                if (!res) {
                  setLoadingComplete(false);
                  toast.error("Image failed to upload");
                  return;
                }

                const image = res.data.image;
                onChange({ coverImage: image });
              }

              onComplete();
              setLoadingComplete(false);
            }}
          >
            Save and continue
          </Button>
          <Button variant="secondary" rounded onClick={onComplete}>
            Skip
          </Button>
        </div>
        <div className="h-20"></div>
      </div>
      <HomepagePreview
        title={data.spaceName}
        description={data.spaceDescription}
        coverSrc={imageData}
        coverFlashing
      />
    </div>
  );
}
