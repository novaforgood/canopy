import React, { useState } from "react";

import classNames from "classnames";

import { Responsive } from "./layout/Responsive";

interface StageNavigatorProps<TStageEnum> {
  currentStage: TStageEnum;
  stages: {
    value: TStageEnum;
    label: string;
  }[];
  enabledStages?: TStageEnum[];
  visitedStages?: TStageEnum[];
  onStageClick?: (stage: TStageEnum) => void;
}

export function StageNavigator<TStageEnum extends string>(
  props: StageNavigatorProps<TStageEnum>
) {
  const {
    currentStage,
    stages,
    onStageClick = () => {},
    enabledStages = [],
    visitedStages = [],
  } = props;

  const [hoveredStage, setHoveredStage] = useState<TStageEnum | null>(null);

  return (
    <>
      <Responsive mode="desktop-only">
        <div className="flex flex-col gap-4 w-full text-gray-700">
          {stages.map(({ value, label }, idx) => {
            const isCurrent = value === currentStage;
            const isHovered = hoveredStage === value;
            const disabled = !enabledStages.includes(value);
            const visited = visitedStages.includes(value);

            const cardStyles = classNames({
              "flex w-full items-center border transition rounded-md": true,
              "cursor-pointer bg-white": !disabled,
              "pointer-events-none bg-gray-50": disabled,
              "border-gray-900": !isCurrent,
              "border-white bg-green-700 text-white": isCurrent,
            });

            const labelStyles = classNames({
              "px-6 py-3 border-l transition": true,
              "border-gray-900": !isCurrent,
              "border-white": isCurrent,
            });

            return (
              <div
                className={cardStyles}
                key={value}
                onClick={() => {
                  if (disabled) return;
                  onStageClick(value);
                }}
                onMouseEnter={() => {
                  if (disabled) return;
                  setHoveredStage(value);
                }}
                onMouseLeave={() => {
                  if (disabled) return;
                  setHoveredStage(null);
                }}
              >
                <div className="w-14 flex justify-center items-center">
                  {idx + 1}
                </div>
                <div className={labelStyles}>{label}</div>
              </div>
            );
          })}
        </div>
      </Responsive>
      <Responsive mode="mobile-only">
        <div className="flex flex-col gap-4 w-full text-gray-700">
          {stages.map(({ value, label }, idx) => {
            const isCurrent = value === currentStage;
            const isHovered = hoveredStage === value;
            const disabled = !enabledStages.includes(value);

            const cardStyles = classNames({
              "flex w-full items-center border-2 transition": true,
              "cursor-pointer bg-white": !disabled,
              "pointer-events-none bg-gray-50": disabled,
              "border-gray-300": !isCurrent && !isHovered,
              "border-gray-900": !isCurrent && isHovered,
              "border-black": isCurrent,
            });

            const labelStyles = classNames({
              "px-6 py-3 border-l-2 transition border-gray-300": true,
            });

            if (isCurrent === false) return null;

            return (
              <div
                className={cardStyles}
                key={value}
                onClick={() => {
                  if (disabled) return;
                  onStageClick(value);
                }}
                onMouseEnter={() => {
                  if (disabled) return;
                  setHoveredStage(value);
                }}
                onMouseLeave={() => {
                  if (disabled) return;
                  setHoveredStage(null);
                }}
              >
                <div className="w-14 flex justify-center items-center">
                  {idx + 1}
                </div>
                <div className={labelStyles}>{label}</div>
              </div>
            );
          })}
        </div>
      </Responsive>
    </>
  );
}
