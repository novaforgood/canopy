import { createClient } from "urql";

export const getUrqlClient = (
  graphqlEndpointUrl: string,
  token: string | null
) => {
  return createClient({
    url: graphqlEndpointUrl,
    fetchOptions: () => {
      return {
        headers: { authorization: token ? `Bearer ${token}` : "" },
      };
    },
  });
};
