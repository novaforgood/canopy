import React, { useEffect, useRef, useState } from "react";

import classNames from "classnames";

import { BxX } from "../../generated/icons/regular";
import { Tooltip } from "../tooltips";

export interface TagProps {
  text: string;
  onDeleteClick?: () => void;
  renderRightIcon?: () => React.ReactNode;
  variant?: "primary" | "outline" | "olive" | "light";
  className?: string;
  style?: React.CSSProperties;
}
export function Tag(props: TagProps) {
  const {
    text,
    renderRightIcon,
    onDeleteClick,
    variant = "primary",
    className,
    style,
  } = props;

  const tagContainerStyles = classNames({
    "rounded-full flex items-center px-3 py-1 overflow-hidden": true,
    "bg-lime-200": variant === "primary",
    "bg-olive-200": variant === "olive",
    "bg-lime-100": variant === "light",
    "bg-white border border-lime-700": variant === "outline",
    [`${className}`]: true,
  });

  const tagStyles = classNames({
    "whitespace-nowrap text-sm truncate": true,
    "text-olive-700": variant === "primary",
    "text-olive-800": variant === "olive",
    "text-lime-700": variant === "outline",
    "text-gray-600": variant === "light",
  });

  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (textElementRef.current) {
      setIsOverflow(
        textElementRef.current.scrollWidth > textElementRef.current.clientWidth
      );
    }
  }, []);

  return (
    <Tooltip
      content={text}
      enabled={isOverflowed}
      placement="right"
      delayMs={[500, 0]}
    >
      <div className={tagContainerStyles} style={style}>
        <div
          className={tagStyles}
          // style={{ fontWeight: 500 }}
          ref={textElementRef}
        >
          {text}
        </div>
        {renderRightIcon
          ? renderRightIcon()
          : onDeleteClick && (
              <BxX
                className="ml-2 -mr-1 h-5 w-5 cursor-pointer text-black hover:text-gray-600"
                onClick={onDeleteClick}
              />
            )}
      </div>
    </Tooltip>
  );
}
