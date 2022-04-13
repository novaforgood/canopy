module.exports = {
  schema: "graphql.schema.json",
  documents: ["./**/*.graphql"],
  overwrite: true,
  generates: {
    "./generated/graphql.tsx": {
      plugins: [
        "typescript",
        "typescript-operations",
        "urql-introspection",
        "typescript-urql",
      ],
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        withRefetchFn: true,
      },
    },
  },
};
