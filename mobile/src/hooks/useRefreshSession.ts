import { useAtom } from "jotai";
import { useMemo, useCallback } from "react";

import { loadSession, LoadSessionProps } from "../lib";
import { sessionAtom } from "../lib/jotai";

export function useRefreshSession() {
  const [session, setSession] = useAtom(sessionAtom);

  const refreshSession = useCallback(
    async (props: (LoadSessionProps & { hardRefresh?: boolean }) | void) => {
      const session = await loadSession(props);

      setSession(session);
    },
    [setSession]
  );

  return useMemo(() => ({ refreshSession }), [refreshSession]);
}
