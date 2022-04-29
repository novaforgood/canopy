function makeQueryFunction(doc) {
  return `export function execute${doc.name}Query(variables: ${doc.name}QueryVariables) {
    return serverUrqlClient.query<${doc.name}Query, ${doc.name}QueryVariables>(${doc.name}Document, variables).toPromise();
  }`;
}

function makeMutationFunction(doc) {
  return `export function execute${doc.name}Mutation(variables: ${doc.name}MutationVariables) {
    return serverUrqlClient.mutation<${doc.name}Mutation, ${doc.name}MutationVariables>(${doc.name}Document, variables).toPromise();
  }`;
}

module.exports = {
  plugin(schema, documents, config) {
    let ret = [];

    documents.forEach((doc) => {
      const docs = doc.document.definitions.map((def) => ({
        name: def.name.value,
        operation: def.operation,
      }));

      docs.forEach((doc) => {
        switch (doc.operation) {
          case "query":
            ret.push(makeQueryFunction(doc));
            break;
          case "mutation":
            ret.push(makeMutationFunction(doc));
            break;
          default:
            break;
        }
      });
    });

    return {
      prepend: ["import { serverUrqlClient } from '../urql'"],
      content: ret.join("\n"),
    };
  },
};

/**
 * export function useSpaceBySlugQuery(options: Omit<Urql.UseQueryArgs<SpaceBySlugQueryVariables>, 'query'>) {
  return Urql.useQuery<SpaceBySlugQuery>({ query: SpaceBySlugDocument, ...options });
};
 */
