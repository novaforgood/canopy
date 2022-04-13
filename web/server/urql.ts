import { createClient } from "urql";
import { requireServerEnv } from "./env";

export const serverUrqlClient = createClient({
  url: requireServerEnv("NEXT_PUBLIC_GRAPHQL_ENDPOINT"),
  fetchOptions: () => {
    return {
      headers: {
        "content-type": "application/json",
        "x-hasura-admin-secret": requireServerEnv("GRAPHQL_ADMIN_SECRET"),
      },
    };
  },
});
