import { useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useUserQuery } from "../generated/graphql";
import { auth } from "../lib/firebase";

export function useUserData() {
  const [user] = useAuthState(auth);
  const [{ data }] = useUserQuery({
    variables: { id: user?.uid ?? "" },
    pause: !user?.uid,
  });

  return useMemo(
    () => ({
      userData: data?.users_by_pk,
    }),
    [data?.users_by_pk]
  );
}
