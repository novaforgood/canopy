import { useMemo } from "react";

import { useRecoilValue } from "recoil";

import { useUserQuery } from "../generated/graphql";
import { sessionAtom } from "../lib/recoil";

export function useUserData() {
  const session = useRecoilValue(sessionAtom);
  const [{ data, fetching }, refetchUserData] = useUserQuery({
    variables: { id: session?.userId ?? "" },
  });

  return useMemo(
    () => ({
      userData: data?.user_by_pk,
      fetchingUserData: fetching,
      refetchUserData,
    }),
    [data?.user_by_pk, fetching, refetchUserData]
  );
}
