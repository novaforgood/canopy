import { useCallback, useMemo } from "react";

import { useRouter } from "next/router";

export function useUpdateQueryParams() {
  const router = useRouter();
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number>) => {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          ...newParams,
        },
      });
    },
    [router]
  );

  return useMemo(() => ({ updateQueryParams }), [updateQueryParams]);
}
