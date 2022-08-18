import React from "react";

import classNames from "classnames";

import { Text } from "../atomic";

interface StepDisplayProps {
  stepNumber: number;
  title: string;
  description: string;
  secondaryDescription?: string;
  highlighted?: boolean;
}

export function StepDisplay(props: StepDisplayProps) {
  const {
    stepNumber,
    title,
    description,
    highlighted = false,
    secondaryDescription,
  } = props;

  const styles = classNames({
    "w-full px-6 py-3 rounded-md flex": true,
    "bg-gray-50": highlighted,
  });

  const titleStyles = classNames({
    "text-black": highlighted,
    "text-gray-800": !highlighted,
  });

  return (
    <div className={styles}>
      <div className="w-12 text-lg text-gray-800 shrink-0">{stepNumber}</div>
      <div className="flex flex-col items-start">
        <Text className={titleStyles}>{title}</Text>
        <div className="h-1"></div>
        <Text variant="body2" className="text-gray-600">
          {description}
        </Text>
        {secondaryDescription && (
          <>
            <div className="h-2"></div>
            <Text variant="body3" className="text-gray-400">
              {secondaryDescription}
            </Text>
          </>
        )}
      </div>
    </div>
  );
}
