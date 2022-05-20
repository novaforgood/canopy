import { ReactNode, useState } from "react";

import { Button, Modal, Text } from "../atomic";

export interface ActionModalProps {
  children?: ReactNode;
  isOpen: boolean;

  actionText: string;
  onAction: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;

  onClose?: () => void;
}

export function ActionModal({
  children,
  isOpen,
  onClose = () => {},
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction = () => {},
}: ActionModalProps) {
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
            onClick={() => {
              onAction();
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
