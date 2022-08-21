import { HTMLAttributes } from "react";

import classNames from "classnames";

export function LoadingPlaceholderRect({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const styles = classNames({
    "animate-pulse rounded-md bg-gray-200": true,
    [`${className}`]: true,
  });
  return <div className={styles} {...rest}></div>;
}
