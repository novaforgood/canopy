import { cacheExchange } from "@urql/exchange-graphcache";
import {
  createClient,
  dedupExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql";

import schema from "../generated/graphql";
import { createClient as createWSClient } from "graphql-ws";

import Constants from "expo-constants";
import {
  chatMessageResolver,
  insertChatMessageUpdater,
  chatMessageStreamUpdater,
  optimisticInsertChatMessageResolver,
  optimisticUpdateProfileToChatRoomResolver,
} from "./urql-chat-resolvers";
import { GRAPHQL_ENDPOINT, GRAPHQL_WS_ENDPOINT } from "./url";

export function getUrqlClient(jwt: string) {
  console.log("getUrqlClient. Jwt length:", jwt.length);

  const wsClient = createWSClient({
    url: GRAPHQL_WS_ENDPOINT,
    connectionParams: {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    },
  });

  return createClient({
    url: GRAPHQL_ENDPOINT,
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
          chat_message_admin_view_aggregate: () => null,
          chat_message_admin_view_aggregate_fields: () => null,
          event_profile_view_aggregate: () => null,
          event_profile_view_aggregate_fields: () => null,
        },

        resolvers: {
          query_root: { chat_message: chatMessageResolver },
        },
        updates: {
          Mutation: {
            insert_chat_message_one: insertChatMessageUpdater,
          },
          Subscription: { chat_message_stream: chatMessageStreamUpdater },
        },
        optimistic: {
          insert_chat_message_one: optimisticInsertChatMessageResolver,
          update_profile_to_chat_room_by_pk:
            optimisticUpdateProfileToChatRoomResolver,
        },
      }),
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
