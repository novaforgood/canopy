import { useCallback } from "react";

import { useRecoilState } from "recoil";

import { Button } from "../components/atomic";
import { loadSession } from "../lib";
import { sessionAtom } from "../lib/recoil";

export default function DebugPage() {
  const [session, setSession] = useRecoilState(sessionAtom);

  const reloadSession = useCallback(async () => {
    const session = await loadSession({
      forceUpdateJwt: true,
    });
    setSession(session);
  }, [setSession]);

  return (
    <div>
      <Button onClick={reloadSession}>Reload JWT</Button>
    </div>
  );
}
