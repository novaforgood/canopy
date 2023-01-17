import { ReactNode, useState } from "react";

import { BxX } from "../../generated/icons/regular";
import { Button, Modal, Text } from "../atomic";

export interface ActionModalProps {
  children?: ReactNode;
  isOpen: boolean;

  actionText: string | ReactNode;
  actionDisabled?: boolean;
  onAction: () => Promise<void> | void;
  secondaryActionText?: string;
  onSecondaryAction?: () => Promise<void> | void;

  onClose?: () => void;
  closeWhenClickedOutside?: boolean;
}

export function ActionModal({
  children,
  isOpen,
  onClose = () => {},
  actionText,
  actionDisabled = false,
  onAction = () => {},
  secondaryActionText,
  onSecondaryAction = () => {},
  closeWhenClickedOutside = false,
}: ActionModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeWhenClickedOutside ? onClose : () => {}}
    >
      <div className="rounded-md bg-white">
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="h-6 w-6">
            <BxX className="hover:text-gray-700" />
          </button>
        </div>
        {children}
        <div className="flex flex-col items-center p-12 pt-0">
          <Button
            rounded
            disabled={actionDisabled}
            loading={loadingAction}
            onClick={async () => {
              setLoadingAction(true);
              await onAction();
              setLoadingAction(false);
            }}
          >
            {actionText}
          </Button>
          {secondaryActionText && (
            <Button variant="secondary" rounded onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
