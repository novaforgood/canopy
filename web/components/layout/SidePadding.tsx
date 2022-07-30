import { ReactNode } from "react";

import classNames from "classnames";

export interface SidePaddingProps {
  children: ReactNode;
  className?: string;
}
export function SidePadding({ children, className }: SidePaddingProps) {
  const styles = classNames({
    "w-full px-6 flex flex-col items-center": true,
    [`${className}`]: true,
  });
  return (
    <div className={styles}>
      <div className="max-w-5xl w-full">{children}</div>
    </div>
  );
}
