import React from "react";

import { BxX } from "../generated/icons/regular";

interface TagProps {
  text: string;
  onDeleteClick?: () => void;
}
export function Tag(props: TagProps) {
  const { text, onDeleteClick } = props;

  return (
    <div className="rounded-full bg-lime-200 flex items-center px-5 py-1">
      <div
        className="whitespace-nowrap text-sm text-olive-700"
        style={{ fontWeight: 500 }}
      >
        {text}
      </div>
      {onDeleteClick && (
        <BxX
          className="w-5 h-5 ml-2 -mr-1 cursor-pointer text-black hover:text-gray-600"
          onClick={onDeleteClick}
        />
      )}
    </div>
  );
}
