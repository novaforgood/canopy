import { ImgHTMLAttributes } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

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
    [`${className}`]: true,
  });

  return src ? (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={styles}
      style={{ ...style, height: desiredHeight }}
      {...rest}
    />
  ) : (
    <div
      ref={ref}
      className={styles}
      style={{ ...style, height: desiredHeight }}
      {...rest}
    ></div>
  );
}
