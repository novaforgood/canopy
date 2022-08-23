import React from "react";

import classNames from "classnames";

import { BxX } from "../generated/icons/regular";

export interface TagProps {
  text: string;
  onDeleteClick?: () => void;
  renderRightIcon?: () => React.ReactNode;
  variant?: "primary" | "outline";
}
export function Tag(props: TagProps) {
  const { text, renderRightIcon, onDeleteClick, variant = "primary" } = props;

  const tagContainerStyles = classNames({
    "rounded-full flex items-center px-3 py-1": true,
    "bg-lime-200": variant === "primary",
    "bg-white border border-lime-700": variant === "outline",
  });

  const tagStyles = classNames({
    "whitespace-nowrap text-xs": true,
    "text-olive-700": variant === "primary",
    "text-lime-700": variant === "outline",
  });

  return (
    <div className={tagContainerStyles}>
      <div className={tagStyles} style={{ fontWeight: 500 }}>
        {text}
      </div>
      {renderRightIcon
        ? renderRightIcon()
        : onDeleteClick && (
            <BxX
              className="w-5 h-5 ml-2 -mr-1 cursor-pointer text-black hover:text-gray-600"
              onClick={onDeleteClick}
            />
          )}
    </div>
  );
}
