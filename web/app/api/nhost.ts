import { NhostClient } from "@nhost/nhost-js";

export function getNhostClient(backendUrl: string) {
  return new NhostClient({
    backendUrl: backendUrl,
  });
}
