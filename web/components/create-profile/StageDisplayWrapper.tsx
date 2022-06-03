import React, { ReactNode, useState } from "react";

import { Button, Text } from "../../components/atomic";

interface StageDisplayWrapperProps {
  children: ReactNode;
  title: string;
  onPrimaryAction?: () => void | Promise<void>;
  onSecondaryAction?: () => void;
  showActions?: boolean;
}

export function StageDisplayWrapper(props: StageDisplayWrapperProps) {
  const {
    children,
    title,
    onPrimaryAction = () => {},
    onSecondaryAction = () => {},
    showActions = true,
  } = props;

  const [loading, setLoading] = useState(false);
  return (
    <div className="py-20 pl-16 flex flex-col justify-between min-h-screen">
      <div>
        <Text variant="heading3">{title}</Text>
        {children}
      </div>
      {showActions && (
        <div className="flex">
          <Button
            variant="primary"
            rounded
            onClick={async () => {
              setLoading(true);
              await onPrimaryAction();
              setLoading(false);
            }}
          >
            Save and continue
          </Button>
          <Button variant="secondary" onClick={onSecondaryAction}>
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}
