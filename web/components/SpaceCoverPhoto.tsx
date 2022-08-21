import { ImgHTMLAttributes, useState } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

import { BxImage } from "../generated/icons/regular";
import { BxsImage } from "../generated/icons/solid";

type SpaceCoverPhotoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function SpaceCoverPhoto(props: SpaceCoverPhotoProps) {
  const { src, alt, className, style, ...rest } = props;

  const styles = classNames({
    "bg-olive-200 h-full w-full flex items-center justify-center": true,
    [`${className}`]: true,
  });

  return (
    <div style={{ ...style, aspectRatio: "4 / 3" }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={styles}
          draggable={false}
          {...rest}
        />
      ) : (
        <div className={styles} {...rest}>
          <BxsImage className="w-1/2 text-gray-50" />
        </div>
      )}
    </div>
  );
}
