import { ReactNode } from "react";

import classNames from "classnames";

export interface SidePaddingProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: keyof JSX.IntrinsicElements;
}
export function SidePadding({
  children,
  className,
  innerClassName,
  as = "div",
}: SidePaddingProps) {
  const styles = classNames({
    "w-full px-6 flex flex-col items-center": true,
    [`${className}`]: true,
  });

  const innerStyles = classNames({
    "max-w-5xl w-full": true,
    [`${innerClassName}`]: true,
  });

  const HtmlTag = as;
  return (
    <HtmlTag className={styles}>
      <div className={innerStyles}>{children}</div>
    </HtmlTag>
  );
}
