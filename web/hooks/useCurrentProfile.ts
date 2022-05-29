import { useCallback, useMemo } from "react";

import {
  Profile_Role_Enum,
  useAllProfilesOfUserQuery,
} from "../generated/graphql";

import { useQueryParam } from "./useQueryParam";
import { useUserData } from "./useUserData";

export function useCurrentProfile() {
  const { userData } = useUserData();
  const slug = useQueryParam("slug", "string");
  const [{ data: allProfilesData, fetching: fetchingCurrentProfile }] =
    useAllProfilesOfUserQuery({
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
    () => ({ currentProfile, currentProfileHasRole, fetchingCurrentProfile }),
    [currentProfile, currentProfileHasRole, fetchingCurrentProfile]
  );
}
