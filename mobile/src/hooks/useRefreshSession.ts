import { useMemo, useCallback } from "react";

import { useRecoilState } from "recoil";

import { loadSession, LoadSessionProps } from "../lib";
import { sessionAtom } from "../lib/recoil";

export function useRefreshSession() {
  const [session, setSession] = useRecoilState(sessionAtom);

  const refreshSession = useCallback(
    async (props: (LoadSessionProps & { hardRefresh?: boolean }) | void) => {
      const session = await loadSession(props);
      setSession(session);
    },
    [setSession]
  );

  return useMemo(() => ({ refreshSession }), [refreshSession]);
}
