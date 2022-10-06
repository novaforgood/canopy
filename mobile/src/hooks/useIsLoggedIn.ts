import { useRecoilValue } from "recoil";

import { sessionAtom } from "../lib/recoil";

export function useIsLoggedIn() {
  const session = useRecoilValue(sessionAtom);
  return session !== null;
}
