import { useAtom } from "jotai";

import { sessionAtom } from "../lib/jotai";

export function useIsLoggedIn() {
  const session = useAtom(sessionAtom);
  return session !== null;
}
