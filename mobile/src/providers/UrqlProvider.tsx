import { useMemo } from "react";

import { useAtom } from "jotai";
import { Provider } from "urql";

import { sessionAtom } from "../lib/jotai";
import { getUrqlClient } from "../lib/urql";

export interface UrqlProviderProps {
  children: React.ReactNode;
}
export function UrqlProvider({ children }: UrqlProviderProps) {
  const [session] = useAtom(sessionAtom);

  const client = useMemo(
    () => getUrqlClient(session?.jwt ?? ""),
    [session?.jwt]
  );

  return <Provider value={client}>{children}</Provider>;
}
