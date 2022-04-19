import { useMemo } from "react";
import { useUserQuery } from "../generated/graphql";
import { useAuthState } from "./useAuthState";

export function useUserData() {
  const { user } = useAuthState();
  const [{ data }] = useUserQuery({
    variables: { id: user?.uid ?? "" },
  });

  return useMemo(
    () => ({
      userData: data?.users_by_pk,
    }),
    [data?.users_by_pk]
  );
}
