import { useMemo } from "react";

import { useAtom } from "jotai";

import { useUserQuery } from "../generated/graphql";
import { sessionAtom } from "../lib/jotai";

export function useUserData() {
  const [session] = useAtom(sessionAtom);
  const [{ data, fetching }] = useUserQuery({
    variables: { id: session?.userId ?? "" },
  });

  return useMemo(
    () => ({
      userData: data?.user_by_pk,
      fetchingUserData: fetching,
    }),
    [data?.user_by_pk, fetching]
  );
}
