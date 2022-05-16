import { useMemo } from "react";

import { useAllProfilesOfUserQuery } from "../generated/graphql";

import { useQueryParam } from "./useQueryParam";
import { useUserData } from "./useUserData";

export function useCurrentProfile() {
  const { userData } = useUserData();
  const slug = useQueryParam("slug", "string");
  const [{ data: allProfilesData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  const currentProfile = useMemo(
    () =>
      allProfilesData?.profile.find((profile) => {
        return profile.space.slug === slug;
      }) ?? null,
    [allProfilesData, slug]
  );

  return useMemo(() => ({ currentProfile }), [currentProfile]);
}
