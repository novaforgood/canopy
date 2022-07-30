import { ImgHTMLAttributes } from "react";

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
  const { ref, width } = useElementSize();

  const desiredHeight = (width * 3) / 4;

  const styles = classNames({
    "bg-olive-200": true,
    [`${className}`]: true,
  });

  return src ? (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={styles}
      draggable={false}
      style={{ ...style, height: desiredHeight }}
      {...rest}
    />
  ) : (
    <div
      ref={ref}
      className={styles}
      style={{
        ...style,
        height: desiredHeight,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      {...rest}
    >
      <BxsImage className="w-1/2 text-gray-50" />
    </div>
  );
}
