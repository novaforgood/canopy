import { useRouter } from "next/router";

import { Text } from "./atomic";
import { ActionModal } from "./modals/ActionModal";

interface PleaseLogInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PleaseLogInModal(props: PleaseLogInModalProps) {
  const { isOpen, onClose } = props;

  const router = useRouter();

  return (
    <ActionModal
      isOpen={isOpen}
      actionText={"Login"}
      onAction={() => {
        router.push(`/login?redirect=${router.asPath}`);
      }}
      secondaryActionText="Cancel"
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <div className="w-80 p-8">
        <Text>Please log in so we can introduce you.</Text>
      </div>
    </ActionModal>
  );
}
