import { ReactNode, useState } from "react";

import { Button, Modal, Text } from "../atomic";

export interface ActionModalProps {
  children?: ReactNode;
  isOpen: boolean;

  actionText: string;
  onAction: () => Promise<void> | void;
  secondaryActionText?: string;
  onSecondaryAction?: () => Promise<void> | void;

  onClose?: () => void;
}

export function ActionModal({
  children,
  isOpen,
  onClose = () => {},
  actionText,
  onAction = () => {},
  secondaryActionText,
  onSecondaryAction = () => {},
}: ActionModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-md">
        <div className="flex justify-end p-8 pb-0">
          <button onClick={onClose}>x</button>
        </div>
        {children}
        <div className="flex flex-col items-center p-12 pt-0">
          <Button
            rounded
            loading={loadingAction}
            onClick={async () => {
              setLoadingAction(true);
              await onAction();
              setLoadingAction(false);
            }}
          >
            {actionText}{" "}
          </Button>
          <Button variant="secondary" rounded onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
