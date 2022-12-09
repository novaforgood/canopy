import { useCallback, useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";

import { mustSaveAtom } from "../lib/jotai";

export function useSaveChangesState() {
  const [mustSave, _setMustSave] = useAtom(mustSaveAtom);
  const [localMustSave, _setLocalMustSave] = useState(false);

  const setMustSave = useCallback(
    (value: boolean) => {
      _setMustSave(value);
      _setLocalMustSave(value);
    },
    [_setMustSave, _setLocalMustSave]
  );

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
      localMustSave,
      mustSave,
      setMustSave,
      validateChangesSaved,
    }),
    [localMustSave, mustSave, setMustSave, validateChangesSaved]
  );
}
