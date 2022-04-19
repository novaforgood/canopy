import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from "urql";
import { requireEnv } from "./env";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    suspense: true,
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    exchanges: [dedupExchange, cacheExchange, fetchExchange],
  });
}
