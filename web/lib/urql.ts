import { createClient } from "urql";
import { requireEnv } from "./env";

export function getUrqlClient(jwt: string) {
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
}
