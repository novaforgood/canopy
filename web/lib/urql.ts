import { cacheExchange } from "@urql/exchange-graphcache";
import { createClient, dedupExchange, fetchExchange } from "urql";
import { requireEnv } from "./env";
import schema from "../generated/graphql";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    requestPolicy: "cache-and-network",
    exchanges: [dedupExchange, cacheExchange({ schema }), fetchExchange],
  });
}
