import { cacheExchange } from "@urql/exchange-graphcache";
import {
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
} from "urql";
import { requireEnv } from "./env";
import schema from "../generated/graphql";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    requestPolicy: "cache-and-network",
    fetchOptions: () => {
      return {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      };
    },
    exchanges: [dedupExchange, cacheExchange({ schema }), fetchExchange],
  });
}
