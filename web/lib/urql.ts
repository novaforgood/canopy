import { createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { requireEnv } from "./env";
import schema from "../generated/graphql";

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
    exchanges: [dedupExchange, cacheExchange({ schema }), fetchExchange],
  });
}
