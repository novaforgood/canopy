import { useAtom } from "jotai";
import { useMemo } from "react";

import { useSpaceBySlugQuery } from "../generated/graphql";
import { currentSpaceSlugAtom } from "../lib/jotai";

export function useCurrentSpace() {
  const [slug] = useAtom(currentSpaceSlugAtom);
  const [{ data: spaceData, fetching }, refetchCurrentSpace] =
    useSpaceBySlugQuery({
      pause: !slug,
      variables: { slug: slug ?? "" },
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
