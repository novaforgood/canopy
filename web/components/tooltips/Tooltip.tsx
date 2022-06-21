import { ReactNode, useState } from "react";

export interface TooltipProps {
  children: ReactNode;
  show: boolean;
  tooltipText: string;
}
export function Tooltip(props: TooltipProps) {
  const { children, show, tooltipText } = props;
  return (
    <div className="relative flex flex-col items-center">
      {show && (
        <div className="absolute bottom-full mb-2 mx-auto text-xs bg-black text-white rounded py-1 px-4 whitespace-nowrap pointer-events-none">
          {tooltipText}
          <svg
            className="absolute text-black h-2 w-full left-0 top-full"
            x="0px"
            y="0px"
            viewBox="0 0 255 255"
            xmlSpace="preserve"
          >
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}
