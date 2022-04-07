module.exports = {
  schema: "graphql.schema.json",
  documents: ["./app/**/*.graphql"],
  overwrite: true,
  generates: {
    "./app/generated/graphql.tsx": {
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
