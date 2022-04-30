import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { ApiClient } from "../lib/apiClient";
import { sessionAtom } from "../lib/recoil";

export function useApiClient() {
  const session = useRecoilValue(sessionAtom);

  return useMemo(() => {
    return {
      apiClient: new ApiClient({
        baseUrl: "",
        sessionJwt: session?.jwt ?? "",
      }),
    };
  }, [session]);
}
