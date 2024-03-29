import { useCallback, useMemo } from "react";

import { useAtom } from "jotai";

import {
  Profile_Role_Enum,
  useAllProfilesOfUserQuery,
} from "../generated/graphql";
import { currentSpaceAtom } from "../lib/jotai";

import { useUserData } from "./useUserData";

export function useCurrentProfile() {
  const { userData } = useUserData();
  const [space] = useAtom(currentSpaceAtom);
  const slug = space?.slug;

  const [
    { data: allProfilesData, fetching: fetchingCurrentProfile },
    refetchCurrentProfile,
  ] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  const currentProfile = useMemo(
    () =>
      allProfilesData?.profile.find((profile) => {
        return profile.space.slug === slug;
      }) ?? null,
    [allProfilesData, slug]
  );

  const currentProfileHasRole = useCallback(
    (role: Profile_Role_Enum) => {
      return currentProfile?.flattened_profile_roles
        .map((role) => role.profile_role)
        .includes(role);
    },
    [currentProfile]
  );

  return useMemo(
    () => ({
      currentProfile,
      currentProfileHasRole,
      fetchingCurrentProfile,
      refetchCurrentProfile,
    }),
    [
      currentProfile,
      currentProfileHasRole,
      fetchingCurrentProfile,
      refetchCurrentProfile,
    ]
  );
}
