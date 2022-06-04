import { useMemo } from "react";

import { useRouter } from "next/router";

import { useSpaceBySlugQuery } from "../generated/graphql";

export function useCurrentSpace() {
  const router = useRouter();
  const [{ data: spaceData, fetching }, refetchCurrentSpace] =
    useSpaceBySlugQuery({
      variables: { slug: router.query.slug as string },
    });
  const space = spaceData?.space[0] ?? null;

  return useMemo(
    () => ({
      currentSpace: space,
      fetchingCurrentSpace: fetching,
      refetchCurrentSpace,
    }),
    [fetching, refetchCurrentSpace, space]
  );
}
