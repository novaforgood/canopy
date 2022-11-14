module.exports = {
  overwrite: true,
  generates: {
    "./src/generated/graphql.tsx": {
      schema: "graphql.schema.json",
      documents: ["../shared/graphql/**/*.graphql"],
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
        scalars: {
          timestamptz: "string",
          uuid: "string",
        },
      },
    },
  },
};
