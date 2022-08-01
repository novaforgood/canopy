import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { Text } from "../atomic";

import { ActionModal, ActionModalProps } from "./ActionModal";

function DefaultModalChildren() {
  return (
    <div className="p-8 flex flex-col text-center">
      <Text variant="subheading1">
        Are you sure you want to leave this page?
      </Text>
      <div className="h-4"></div>
      <Text className="text-gray-700">Changes you made may not be saved.</Text>
    </div>
  );
}

interface CatchUnsavedChangesModalProps {
  unsavedChangesExist: boolean;
  onRouteChangePrevented?: (futureURL: string) => void;
}
function CatchUnsavedChangesModal({
  unsavedChangesExist,
  onRouteChangePrevented = () => {},
  secondaryActionText = "Cancel",
  actionText = "Leave",
  children = <DefaultModalChildren />,
}: Omit<
  Partial<ActionModalProps>,
  "isOpen" | "onSecondaryButtonClick" | "onPrimaryButtonClick" | "onClose"
> &
  CatchUnsavedChangesModalProps) {
  const [open, setOpen] = useState(false);
  const [futureURL, setFutureURL] = useState("");

  const router = useRouter();

  const routeChangeStart = useCallback(
    (url: string) => {
      if (router.asPath !== url && unsavedChangesExist === true && !open) {
        router.events.emit("routeChangeError");
        setFutureURL(url);
        setOpen(true);
        onRouteChangePrevented && onRouteChangePrevented(url);
        // Following is a hack-ish solution to abort a Next.js route change
        // as there's currently no official API to do so
        // See https://github.com/zeit/next.js/issues/2476#issuecomment-573460710
        // eslint-disable-next-line no-throw-literal
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      }
    },
    [
      onRouteChangePrevented,
      open,
      router.asPath,
      router.events,
      unsavedChangesExist,
    ]
  );

  useEffect(() => {
    // https://github.com/vercel/next.js/issues/2476#issuecomment-604679740

    /**
     * Returning a string in this function causes there to be a popup when
     * the user tries to unload the page. We only want the popup to show
     * when there are unsaved changes.
     */
    window.onbeforeunload = () => {
      if (unsavedChangesExist === true) return "Some string";
    };

    router.events.on("routeChangeStart", routeChangeStart);

    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
    };
  }, [
    onRouteChangePrevented,
    open,
    routeChangeStart,
    router.asPath,
    router.events,
    unsavedChangesExist,
  ]);

  return (
    <ActionModal
      isOpen={open}
      actionText={actionText}
      secondaryActionText={secondaryActionText}
      onAction={() => {
        router.push(futureURL);
      }}
      onSecondaryAction={() => {
        setOpen(false);
      }}
      onClose={() => {
        setOpen(false);
      }}
    >
      {children}
    </ActionModal>
  );
}

export default CatchUnsavedChangesModal;
