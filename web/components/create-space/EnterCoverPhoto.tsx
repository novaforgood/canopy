import React, { useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "@mantine/hooks";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import { BxCaretDown } from "../../generated/icons/regular";
import { BxsCloudUpload } from "../../generated/icons/solid";
import { uploadImage } from "../../lib/image";
import { Button, Input, Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { ImageUploader } from "../ImageUploader";
import { SpaceCoverPhoto } from "../SpaceCoverPhoto";

const ARRAY_LENGTH_8 = new Array(8).fill(0);

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
    console.log("Lole");
    const imageData =
      editor.current?.getImageScaledToCanvas().toDataURL() ?? null;
    setImageData(imageData);
  }, [debouncedDimensions, imageSrc]);

  return (
    <div className="flex gap-20 justify-start items-start h-full">
      <div className="flex flex-col items-start w-full">
        <div className="h-10"></div>
        <Text variant="heading3">
          Upload a homepage picture for your directory. (optional)
        </Text>
        <div className="h-2"></div>
        <Text variant="subheading2" className="text-gray-600">
          This can be a logo, a picture of your community, or anything you want!
        </Text>
        <div className="h-8"></div>
        <ImageUploader
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
      <div className="border border-black rounded-md p-4 w-120 mt-12 shrink-0">
        <div className="flex items-center justify-between truncate">
          <Text variant="subheading1" className="p-2">
            {data.spaceName}
          </Text>
          <div className="flex gap-1 items-center">
            <div className="rounded-full bg-gray-700 h-5 w-5"></div>
            <BxCaretDown className="h-5 w-5" />
          </div>
        </div>

        <div className="h-8"></div>
        <div className="flex w-full items-center gap-4">
          <div className="flex-1 flex flex-col items-start gap-2 p-2">
            <Text variant="heading4">{data.spaceName}</Text>
            <HtmlDisplay html={data.spaceDescription} className="text-xs" />
          </div>
          <SpaceCoverPhoto
            className="flex-1 bg-teal-50 animate-pulse"
            src={imageData}
          />
        </div>
        <div className="w-full h-0.5 bg-gray-50 my-8"></div>
        <div className="grid grid-cols-4 gap-4 w-full">
          {ARRAY_LENGTH_8.map((_, idx) => {
            return <div key={idx} className="rounded-md bg-gray-50 h-28" />;
          })}
        </div>
      </div>
    </div>
  );
}
