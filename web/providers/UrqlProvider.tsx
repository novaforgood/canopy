import { useMemo } from "react";

import { useRecoilValue } from "recoil";
import { Provider } from "urql";

import { sessionAtom } from "../lib/recoil";
import { getUrqlClient } from "../lib/urql";

export interface UrqlProviderProps {
  children: React.ReactNode;
}
export function UrqlProvider({ children }: UrqlProviderProps) {
  const session = useRecoilValue(sessionAtom);

  const client = useMemo(
    () => getUrqlClient(session?.jwt ?? ""),
    [session?.jwt]
  );

  return <Provider value={client}>{children}</Provider>;
}
