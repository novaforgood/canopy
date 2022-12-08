import { useEffect, useState } from "react";

import { useAtom } from "jotai";
import { useRouter } from "next/router";

import { mustSaveAtom } from "../../lib/jotai";
import { Text } from "../atomic";
import { ActionModal } from "../modals/ActionModal";

export function CatchUnsavedChanges() {
  const [mustSave, setMustSave] = useAtom(mustSaveAtom);

  const router = useRouter();

  useEffect(() => {
    // https://github.com/vercel/next.js/issues/2476#issuecomment-604679740

    const routeChangeStart = (url: string) => {
      if (router.asPath !== url && mustSave === true) {
        router.events.emit("routeChangeError");

        if (
          !window.confirm(
            "You have unsaved changes. Are you sure you want to leave?"
          )
        ) {
          router.events.emit("routeChangeComplete", url);

          // Following is a hack-ish solution to abort a Next.js route change
          // as there's currently no official API to do so
          // See https://github.com/zeit/next.js/issues/2476#issuecomment-573460710
          // eslint-disable-next-line no-throw-literal
          throw "Abort route change. Please ignore this error.";
        } else {
          setMustSave(false);
        }
      }
    };

    /**
     * Returning a string in this function causes there to be a popup when
     * the user tries to unload the page. We only want the popup to show
     * when there are unsaved changes.
     */
    window.onbeforeunload = () => {
      if (mustSave === true) return "Some string";
    };

    router.events.on("routeChangeStart", routeChangeStart);

    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
    };
  }, [router.asPath, router.events, mustSave, setMustSave]);

  return null;
}
