import { useMemo } from "react";

import { useRecoilValue } from "recoil";

import { useUserQuery } from "../generated/graphql";
import { sessionAtom } from "../lib/recoil";

export function useUserData() {
  const session = useRecoilValue(sessionAtom);
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
