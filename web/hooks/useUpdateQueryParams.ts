import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

export function useUpdateQueryParams() {
  const router = useRouter();
  const updateQueryParams = useCallback(
    (newParams: Record<string, any>) => {
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
