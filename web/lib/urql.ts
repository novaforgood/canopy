import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
} from "urql";
import { requireEnv } from "./env";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    exchanges: [dedupExchange, cacheExchange, fetchExchange],
  });
}
