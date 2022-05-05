import { useRouter } from "next/router";
import { useMemo } from "react";
import { useSpaceBySlugQuery } from "../generated/graphql";

export function useCurrentSpace() {
  const router = useRouter();
  const [{ data: spaceData, fetching }] = useSpaceBySlugQuery({
    variables: { slug: router.query.slug as string },
  });
  const space = spaceData?.space[0] ?? null;

  return useMemo(
    () => ({ currentSpace: space, fetchingCurrentSpace: fetching }),
    [fetching, space]
  );
}
