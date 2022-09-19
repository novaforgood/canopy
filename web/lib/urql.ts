import { isServer } from "./index";
import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import {
  createClient,
  dedupExchange,
  fetchExchange,
  stringifyVariables,
  subscriptionExchange,
} from "urql";

import schema from "../generated/graphql";

import { requireEnv } from "./env";
import { createClient as createWSClient } from "graphql-ws";
import { MESSAGES_PER_FETCH } from "../components/chats/constants";
import { nanoid } from "nanoid";
import {
  chatMessageResolver,
  insertChatMessageUpdater,
  chatMessageStreamUpdater,
  optimisticInsertChatMessageResolver,
} from "./urql-chat-resolvers";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);

  const wsClient = isServer()
    ? null
    : createWSClient({
        url: requireEnv("NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT"),
        connectionParams: {
          headers: {
            authorization: `Bearer ${jwt}`,
          },
        },
      });

  if (!wsClient) {
    return null;
  }

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
          profile_aggregate: () => null,
          profile_aggregate_fields: () => null,
          connection_request_aggregate: () => null,
          connection_request_aggregate_fields: () => null,
        },

        resolvers: {
          query_root: { chat_message: chatMessageResolver },
        },
        updates: {
          Mutation: { insert_chat_message_one: insertChatMessageUpdater },
          Subscription: { chat_message_stream: chatMessageStreamUpdater },
        },
        optimistic: {
          insert_chat_message_one: optimisticInsertChatMessageResolver,
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
      subscriptionExchange({
        forwardSubscription: (operation) => ({
          subscribe: (sink) => {
            const dispose = wsClient.subscribe(operation, sink);
            return {
              unsubscribe: dispose,
            };
          },
        }),
      }),
    ],
  });
}
