import { useCallback, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import AvatarEditor from "react-avatar-editor";

import { useSingleImageDropzone } from "../hooks/useSingleImageDropzone";

import { Text, Button } from "./atomic";

interface ImageUploaderProps {
  getRef?: (editor: AvatarEditor | null) => void;
  width: number;
  height: number;
  showZoom?: boolean;
}

export function ImageUploader(props: ImageUploaderProps) {
  const { getRef = () => {}, width, height, showZoom = false } = props;

  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
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
      setSrc(url);
      setLoaded(false);
    },
    noClick: !!src,
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
  }, [src]);

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
    "hover:brightness-95": !src,
    "border-teal-500 hover:border-teal-700": isDragActive,
  });
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: width, height: height }}>
        <div
          {...getRootProps()}
          className={styles}
          onMouseEnter={() => {
            setHovered(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
          onMouseDown={() => {
            if (showReposition) {
              setShowReposition(false);
              setShowRepositionActivated(false);
            }
          }}
        >
          {src && (
            <AvatarEditor
              onLoadSuccess={() => {
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
              image={src ?? ""}
              scale={scale}
              border={0}
              position={position}
              onPositionChange={(pos) => setPosition(pos)}
            />
          )}

          <input {...getInputProps()} />

          {src ? (
            showReposition && (
              <div className="absolute top-2 bg-black/50 py-1 px-2 pointer-events-none">
                <Text variant="body2" className="text-white">
                  Drag to reposition
                </Text>
              </div>
            )
          ) : (
            <>
              <div>
                <div>Drop image here</div>
                <div>or click to upload</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ width: 250 }}>
        {!!src && (
          <>
            {showZoom && (
              <div className="flex items-center gap-2 mt-8">
                <button
                  onClick={() => {
                    // Decrement scale by 0.5
                    setScale((prev) => Math.max(prev - 0.5, 1));
                  }}
                  className="flex-none flex items-center justify-center rounded-sm h-5 w-5 border border-gray-50 hover:bg-gray-50 shadow-md active:translate-y-px"
                >
                  -
                </button>
                <input
                  className="appearance-none w-full h-1 bg-gray-200 rounded outline-none slider-thumb"
                  type="range"
                  min={1}
                  max={3}
                  step={0.001}
                  value={scale}
                  onChange={(e) => {
                    setScale(parseFloat(e.target.value));
                  }}
                />
                <button
                  onClick={() => {
                    // Increment scale by 0.5
                    setScale((prev) => Math.min(prev + 0.5, 3));
                  }}
                  className="flex-none flex items-center justify-center rounded-sm h-5 w-5 border border-gray-50 hover:bg-gray-50 shadow-md active:translate-y-px"
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
                  setSrc(null);
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
