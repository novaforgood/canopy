import { ReactNode } from "react";

export interface TwoThirdsPageLayoutProps {
  children: ReactNode;
  renderLeft?: () => ReactNode;
}

export function TwoThirdsPageLayout(props: TwoThirdsPageLayoutProps) {
  const { children, renderLeft = () => null } = props;
  return (
    <div className="h-screen flex">
      <div className="hidden md:block w-1/3 h-full bg-olive-100">
        {renderLeft()}
      </div>
      <div className="w-full sm:w-2/3 sm:h-full">{children}</div>
    </div>
  );
}
