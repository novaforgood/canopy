import { useMemo } from "react";

import { useRouter } from "next/router";

import { useSpaceBySlugQuery } from "../generated/graphql";

export function useCurrentSpace() { // fetches the data corresponding to the space that you're currently in (e.x. if I'm in Soccer Fans)
  const router = useRouter();
  const [{ data: spaceData, fetching }, refetchCurrentSpace] =
    useSpaceBySlugQuery({
      pause: !router.query.slug,
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
