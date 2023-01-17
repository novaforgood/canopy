import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";
import AvatarEditor from "react-avatar-editor";

import { BxsCloudUpload } from "../../generated/icons/solid";
import { useSingleImageDropzone } from "../../hooks/useSingleImageDropzone";

import { Text, Button } from "./../atomic";

interface ImageUploaderProps {
  getRef?: (editor: AvatarEditor | null) => void;
  width: number;
  height: number;
  scaleWidth?: boolean; // If true, width of component is set to 100%
  showZoom?: boolean;
  showRoundedCrop?: boolean;
  renderUploadIcon?: () => ReactNode;
  imageSrc: string | null;
  onImageSrcChange?: (newValue: string | null) => void;
  onPositionChange?: (newValue: { x: number; y: number }) => void;
  onScaleChange?: (newValue: number) => void;
  onLoadSuccess?: () => void;
}

export function ImageUploader(props: ImageUploaderProps) {
  const {
    getRef = () => {},
    showRoundedCrop = false,
    scaleWidth = false,
    width,
    height,
    showZoom = false,
    renderUploadIcon = () => null,
    imageSrc,
    onImageSrcChange = () => {},
    onPositionChange = () => {},
    onScaleChange = () => {},
    onLoadSuccess = () => {},
  } = props;

  const [loaded, setLoaded] = useState(false);
  const editor = useRef<AvatarEditor | null>(null);
  const [showReposition, setShowReposition] = useState(false);
  const [showRepositionActivated, setShowRepositionActivated] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileUpload,
  } = useSingleImageDropzone({
    onDropAccepted: (file) => {
      const url = URL.createObjectURL(file);
      onImageSrcChange(url);
      setLoaded(false);
    },
    noClick: !!imageSrc,
  });

  const canReposition = useCallback(() => {
    if (!editor.current || !loaded) return false;
    const { height, width } = editor.current.state.image;
    const aspectRatio = width / height;
    return scale > 1 || Math.abs(aspectRatio - 1) > 0.01;
  }, [loaded, scale]);

  useEffect(() => {
    setPosition({ x: 0.5, y: 0.5 });
    setScale(1);
  }, [imageSrc]);

  useEffect(() => {
    if (loaded) {
      if (showRepositionActivated) {
        setShowReposition(canReposition());
      }
    }
  }, [canReposition, showRepositionActivated, loaded]);

  useEffect(() => {
    if (!showRepositionActivated) {
      setShowReposition(false);
    }
  }, [showRepositionActivated]);

  const styles = classNames({
    "w-full relative h-full box-border flex justify-center items-center rounded-sm border-dashed border-4 border-gray-400 bg-gray-100 cursor-pointer":
      true,
    "hover:brightness-95": !imageSrc,
    "border-green-500 hover:border-green-700": isDragActive,
  });

  const { ref, width: calculatedWidth } = useElementSize();
  const desiredHeight = (calculatedWidth * height) / width;

  const scaledWidth = scaleWidth ? "100%" : width;
  const scaledHeight = scaleWidth ? desiredHeight : height;

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: scaleWidth ? "100%" : "auto" }}
    >
      <div ref={ref} style={{ width: scaledWidth, height: scaledHeight }}>
        <div
          {...getRootProps()}
          className={styles}
          onMouseDown={() => {
            if (showReposition) {
              setShowReposition(false);
              setShowRepositionActivated(false);
            }
          }}
        >
          {imageSrc && (
            <AvatarEditor
              crossOrigin="anonymous"
              onLoadSuccess={() => {
                onLoadSuccess();
                setShowRepositionActivated(true);
                setLoaded(true);
              }}
              ref={(ed) => {
                editor.current = ed;
                getRef(ed);
              }}
              width={width}
              height={height}
              style={{ width: "100%", height: "100%" }}
              image={imageSrc ?? ""}
              scale={scale}
              border={0}
              position={position}
              onPositionChange={(pos) => {
                onPositionChange(pos);
                setPosition(pos);
              }}
            />
          )}

          {imageSrc && showRoundedCrop && (
            <div className="pointer-events-none absolute h-full w-full rounded-full border border-gray-500"></div>
          )}

          <input {...getInputProps()} />

          {imageSrc ? (
            showReposition && (
              <div className="pointer-events-none absolute top-2 bg-black/50 py-1 px-2">
                <Text variant="body2" className="text-white">
                  Drag to reposition
                </Text>
              </div>
            )
          ) : (
            <>
              <div className="flex flex-col items-center">
                {renderUploadIcon()}
                <div>Drop image here</div>
                <div>or click to upload</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ width: 250 }}>
        {!!imageSrc && (
          <>
            {showZoom && (
              <div className="mt-8 flex items-center gap-2">
                <button
                  onClick={() => {
                    // Decrement scale by 0.5
                    setScale((prev) => {
                      const newVal = Math.max(prev - 0.5, 1);
                      onScaleChange(newVal);
                      return newVal;
                    });
                  }}
                  className="flex h-5 w-5 flex-none items-center justify-center rounded-sm border border-gray-50 shadow-md hover:bg-gray-50 active:translate-y-px"
                >
                  -
                </button>
                <input
                  className="slider-thumb h-1 w-full appearance-none rounded bg-gray-200 outline-none"
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.001}
                  value={scale}
                  onChange={(e) => {
                    onScaleChange(parseFloat(e.target.value));
                    setScale(parseFloat(e.target.value));
                  }}
                />
                <button
                  onClick={() => {
                    // Increment scale by 0.5
                    setScale((prev) => {
                      const newVal = Math.min(prev + 0.5, 3);
                      onScaleChange(newVal);
                      return newVal;
                    });
                  }}
                  className="flex h-5 w-5 flex-none items-center justify-center rounded-sm border border-gray-50 shadow-md hover:bg-gray-50 active:translate-y-px"
                >
                  +
                </button>
              </div>
            )}
            <div className="h-4"></div>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  onImageSrcChange(null);
                }}
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  openFileUpload();
                }}
              >
                Change
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
