import { useCallback, useMemo } from "react";

import { useAtom } from "jotai";

import {
  useUpdateUserAttributesMutation,
  useUserQuery,
} from "../generated/graphql";
import { sessionAtom } from "../lib/jotai";
import { resolveUserAttributes, UserAttributes } from "../lib/userAttributes";

export function useUserData() {
  const [session] = useAtom(sessionAtom);
  const [{ data, fetching }, refetchUserData] = useUserQuery({
    variables: { id: session?.userId ?? "" },
  });

  const userData = data?.user_by_pk;

  const [_, _updateUserAttributes] = useUpdateUserAttributesMutation();

  const updateUserAttributes = useCallback(
    async (attributes: Partial<UserAttributes>) => {
      if (!userData) {
        throw new Error("No user data");
      }
      return _updateUserAttributes({
        changes: attributes,
        user_id: userData?.id ?? "",
      });
    },
    [userData, _updateUserAttributes]
  );
  const userAttributes: UserAttributes = useMemo(
    () => resolveUserAttributes(userData?.attributes ?? {}),
    [userData]
  );

  return useMemo(
    () => ({
      userData: userData,
      fetchingUserData: fetching,
      refetchUserData,
      userAttributes,
      updateUserAttributes,
    }),
    [fetching, refetchUserData, userData, userAttributes, updateUserAttributes]
  );
}
