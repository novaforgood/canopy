import { useMemo, useCallback } from "react";

import { useAtom } from "jotai";

import { toast } from "../components/CustomToast";
import { loadSession, LoadSessionProps } from "../lib";
import { signOut } from "../lib/firebase";
import { sessionAtom } from "../lib/jotai";

export function useRefreshSession() {
  const [session, setSession] = useAtom(sessionAtom);

  const refreshSession = useCallback(
    async (props: (LoadSessionProps & { hardRefresh?: boolean }) | void) => {
      const session = await loadSession(props).catch((e) => {
        console.error("Error in loadSession", e);
        toast.error("Error loading session");
        signOut();
        return null;
      });

      setSession(session);
    },
    [setSession]
  );

  return useMemo(() => ({ refreshSession }), [refreshSession]);
}
