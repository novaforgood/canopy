import { ReactNode } from "react";

export interface TwoThirdsPageLayoutProps {
  children: ReactNode;
  renderLeft?: () => ReactNode;
}
export function TwoThirdsPageLayout(props: TwoThirdsPageLayoutProps) {
  const { children, renderLeft = () => null } = props;
  return (
    <div className="h-full flex">
      <div className="w-1/3 h-full bg-gray-50">{renderLeft()}</div>
      <div className="w-2/3 h-full">{children}</div>
    </div>
  );
}
