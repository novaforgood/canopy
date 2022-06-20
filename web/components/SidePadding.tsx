import { ReactNode } from "react";

export interface SidePaddingProps {
  children: ReactNode;
}
export function SidePadding({ children }: SidePaddingProps) {
  return (
    <div className="w-full px-6 flex flex-col items-center">
      <div className="max-w-5xl w-full">{children}</div>
    </div>
  );
}
