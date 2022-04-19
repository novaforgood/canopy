import { useMemo } from "react";
import { useUserQuery } from "../generated/graphql";
import { useAuthState } from "./useAuthState";

export function useUserData() {
  const { user } = useAuthState();
  const [{ data }, refetch] = useUserQuery({
    variables: { id: user?.uid ?? "" },
    pause: !user?.uid,
  });

  return useMemo(
    () => ({
      userData: data?.users_by_pk,
      refetch,
    }),
    [data?.users_by_pk, refetch]
  );
}
