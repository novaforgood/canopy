import { useAtom } from "jotai";
import { useMemo } from "react";

import { useSpaceBySlugQuery } from "../generated/graphql";
import { currentSpaceAtom } from "../lib/jotai";

export function useCurrentSpace() {
  const [spaceRaw] = useAtom(currentSpaceAtom);
  const slug = spaceRaw?.slug;

  const [{ data: spaceData, fetching }, refetchCurrentSpace] =
    useSpaceBySlugQuery({
      pause: !slug,
      variables: { slug: slug ?? "" },
    });
  const space = spaceData?.space[0] ?? null;

  return useMemo(
    () => ({
      currentSpace: spaceRaw
        ? {
            name: spaceRaw.name,
            slug: spaceRaw.slug,
            ...space,
          }
        : undefined,
      fetchingCurrentSpace: fetching,
      refetchCurrentSpace,
    }),
    [fetching, refetchCurrentSpace, space]
  );
}
