import { useAtom } from "jotai";

import { sessionAtom } from "../lib/jotai";

export function useIsLoggedIn() {
  const [session] = useAtom(sessionAtom);
  console.log(session);
  return session !== null;
}
