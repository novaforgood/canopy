import { useCallback, useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import { promise } from "zod";

import { mustSaveAtom } from "../lib/jotai";

export function useSaveChangesState() {
  const [mustSave, setMustSave] = useAtom(mustSaveAtom);

  // Set mustSaveChanges to false on mount
  useEffect(() => {
    setMustSave(false);
  }, [setMustSave]);

  const validateChangesSaved: () => Promise<boolean> = useCallback(async () => {
    return new Promise((resolve) => {
      if (mustSave === true) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?"
        );

        if (confirmed) {
          setMustSave(false);
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  }, [mustSave, setMustSave]);

  return useMemo(
    () => ({
      mustSave,
      setMustSave,
      validateChangesSaved,
    }),
    [mustSave, setMustSave, validateChangesSaved]
  );
}
