import { useCallback, useMemo } from "react";

import {
  Profile_Role_Enum,
  useAllProfilesOfUserQuery,
  useUpdateProfileAttributesMutation,
} from "../generated/graphql";
import {
  ProfileAttributes,
  resolveProfileAttributes,
} from "../lib/profileAttributes";

import { useQueryParam } from "./useQueryParam";
import { useUserData } from "./useUserData";

export function useCurrentProfile() {
  const { userData } = useUserData();
  const slug = useQueryParam("slug", "string");
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

  const [_, _updateProfileAttributes] = useUpdateProfileAttributesMutation();

  const updateProfileAttributes = useCallback(
    async (attributes: Partial<ProfileAttributes>) => {
      if (!currentProfile) {
        throw new Error("No profile data");
      }
      return _updateProfileAttributes({
        changes: attributes,
        profile_id: currentProfile.id,
      });
    },
    [_updateProfileAttributes, currentProfile]
  );

  const profileAttributes = useMemo(
    () => resolveProfileAttributes(currentProfile?.attributes ?? {}),
    [currentProfile]
  );

  return useMemo(
    () => ({
      currentProfile,
      currentProfileHasRole,
      fetchingCurrentProfile,
      refetchCurrentProfile,
      profileAttributes,
      updateProfileAttributes,
    }),
    [
      currentProfile,
      currentProfileHasRole,
      fetchingCurrentProfile,
      profileAttributes,
      refetchCurrentProfile,
      updateProfileAttributes,
    ]
  );
}
