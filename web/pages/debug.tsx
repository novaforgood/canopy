import { useCallback } from "react";

import { useAtom } from "jotai";

import { Button, Text } from "../components/atomic";
import { loadSession } from "../lib";
import { sessionAtom } from "../lib/jotai";
import { LocalStorage } from "../lib/localStorage";
import { CustomPage } from "../types";

const DebugPage: CustomPage = () => {
  const [session, setSession] = useAtom(sessionAtom);

  const reloadSession = useCallback(async () => {
    const session = await loadSession({
      forceUpdateJwt: true,
    });
    setSession(session);
  }, [setSession]);

  return (
    <div className="flex flex-col items-start gap-4 p-4">
      <Text variant="heading3">Debug</Text>
      <Button onClick={reloadSession}>Reload JWT</Button>
      <Button
        onClick={() => {
          LocalStorage.clear();
        }}
      >
        Clear LocalStorage
      </Button>
    </div>
  );
};

DebugPage.showFooter = false;

export default DebugPage;
