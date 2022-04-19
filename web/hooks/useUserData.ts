import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { useUserQuery } from "../generated/graphql";
import { sessionAtom } from "../lib/recoil";

export function useUserData() {
  const session = useRecoilValue(sessionAtom);
  const [{ data }] = useUserQuery({
    variables: { id: session?.userId ?? "" },
  });

  return useMemo(
    () => ({
      userData: data?.users_by_pk,
    }),
    [data?.users_by_pk]
  );
}
