import { ReactNode } from "react";

import classNames from "classnames";

import { Text } from "../atomic";
import { SidePadding } from "../SidePadding";

interface LandingSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export function LandingSection(props: LandingSectionProps) {
  const { title, subtitle, className, children } = props;

  const styles = classNames({
    "flex flex-col justify-start items-start border-t border-green-900 py-24":
      true,
    [`${className}`]: true,
  });
  return (
    <div className={styles}>
      <SidePadding>
        <div className="flex flex-col items-center text-green-900">
          {title && (
            <Text
              variant="heading3"
              mobileVariant="heading4"
              className="text-center max-w-2xl"
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <>
              <div className="h-4"></div>
              <Text variant="body2" className="text-center max-w-3xl">
                {subtitle}
              </Text>
            </>
          )}
          {children}
        </div>
      </SidePadding>
    </div>
  );
}
