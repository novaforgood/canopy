import { ReactNode } from "react";

export interface TwoThirdsPageLayoutProps {
  children: ReactNode;
  renderLeft?: () => ReactNode;
}

export function TwoThirdsPageLayout(props: TwoThirdsPageLayoutProps) {
  const { children, renderLeft = () => null } = props;
  return (
    <div className="flex h-[calc(100dvh)]">
      <div className="hidden h-full w-1/3 bg-olive-100 md:block">
        {renderLeft()}
      </div>
      <div className="w-full sm:h-full sm:w-2/3">{children}</div>
    </div>
  );
}
