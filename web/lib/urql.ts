import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { retryExchange } from "@urql/exchange-retry";
import {
  createClient,
  dedupExchange,
  fetchExchange,
  makeOperation,
} from "urql";

import schema, {
  Profile_To_Profile_Role_Flattened,
} from "../generated/graphql";

import { requireEnv } from "./env";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);
  return createClient({
    url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
    requestPolicy: "cache-and-network",
    maskTypename: true,
    fetchOptions: () => {
      if (jwt.length === 0) return {};

      return {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      };
    },
    exchanges: [
      devtoolsExchange,
      dedupExchange,
      cacheExchange({
        schema,
        keys: {
          profile_to_profile_role_flattened: (data) =>
            `${data.profile_id}-${data.profile_role}`,
        },
      }),
      // retryExchange({
      //   maxNumberAttempts: 2,
      //   retryIf: (error) => {
      //     for (const err of error.graphQLErrors) {
      //       if (err.extensions.code === "invalid-jwt") {
      //         return true;
      //       }
      //     }
      //     return false;
      //   },
      // }),
      fetchExchange,
    ],
  });
}

/**
 * "errors": [
        {
            "extensions": {
                "path": "$",
                "code": "invalid-jwt"
            },
            "message": "Could not verify JWT: JWTExpired"
        }
    ]
 */
