import { useMemo } from "react";

import { useUpdateUserAttributesMutation } from "../generated/graphql";
import { DEFAULT_USER_ATTRIBUTES } from "../lib/userAttributes";

import { UserAttributes } from "./../lib/userAttributes";
import { useUserData } from "./useUserData";

export function useUserAttributes() {
  const { userData } = useUserData();

  const [_, updateUserAttributes] = useUpdateUserAttributesMutation();

  const userAttributes: UserAttributes = useMemo(
    () => ({
      ...DEFAULT_USER_ATTRIBUTES,
      ...userData?.attributes,
    }),
    [userData]
  );

  return useMemo(
    () => ({
      userAttributes,
      updateUserAttributes,
    }),
    [userAttributes, updateUserAttributes]
  );
}
