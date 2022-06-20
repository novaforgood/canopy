import { HTMLAttributes } from "react";

import classNames from "classnames";

type ResponsiveProps = HTMLAttributes<HTMLDivElement> & {
  mode: "mobile-only" | "desktop-only";
};

export function Responsive(props: ResponsiveProps) {
  const { className, mode, ...rest } = props;

  const styles = classNames({
    "block sm:hidden": mode === "mobile-only",
    "hidden sm:block": mode === "desktop-only",
    [`${className}`]: true,
  });
  return <div {...rest} className={styles} />;
}
