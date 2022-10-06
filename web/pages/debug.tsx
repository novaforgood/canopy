import { useCallback } from "react";

import { useRecoilState } from "recoil";

import { Button, Text } from "../components/atomic";
import { loadSession } from "../lib";
import { LocalStorage } from "../lib/localStorage";
import { sessionAtom } from "../lib/recoil";
import { CustomPage } from "../types";

const DebugPage: CustomPage = () => {
  const [session, setSession] = useRecoilState(sessionAtom);

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
