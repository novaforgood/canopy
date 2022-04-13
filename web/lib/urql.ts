import { authExchange } from "@urql/exchange-auth";
import { createClient } from "urql";
import { requireEnv } from "./env";
import { auth } from "./firebase";

export const urqlClient = createClient({
  url: requireEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
  exchanges: [
    authExchange({
      getAuth: async () => {
        return {
          token: await auth.currentUser?.getIdToken(),
        };
      },
      addAuthToOperation: ({ authState, operation }) => {
        // the token isn't in the auth state, return the operation without changes
        if (!authState || !authState.token) {
          return operation;
        }

        // fetchOptions can be a function (See Client API) but you can simplify this based on usage
        const fetchOptions =
          typeof operation.context.fetchOptions === "function"
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        return {
          ...operation,
          context: {
            ...operation.context,
            fetchOptions: {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                Authorization: authState.token,
              },
            },
          },
        };
      },
    }),
  ],
});
