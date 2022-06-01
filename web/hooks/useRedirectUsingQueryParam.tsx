import { useCallback, useMemo } from "react";

import { useRouter } from "next/router";

import { useQueryParam } from "./useQueryParam";

export function useRedirectUsingQueryParam() {
  const redirect = useQueryParam("redirect", "string");
  const router = useRouter();

  const redirectUsingQueryParam = useCallback(
    async (path: string) => {
      if (redirect) {
        await router.push(redirect);
      } else {
        await router.push(path);
      }
    },
    [redirect, router]
  );

  return useMemo(
    () => ({ redirectUsingQueryParam }),
    [redirectUsingQueryParam]
  );
}
