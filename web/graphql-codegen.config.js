module.exports = {
  overwrite: true,
  generates: {
    "./generated/graphql.tsx": {
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
    "./server/generated/serverGraphql.tsx": {
      schema: "graphql-admin.schema.json",
      documents: ["./server/**/*.graphql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "urql-introspection",
        "typescript-urql",
        "./graphql-codegen-urql-server.js",
      ],
      config: {
        skipTypename: false,
        withHOC: false,
        withComponent: false,
        withHooks: false,
        urqlImportFrom: "../urql",
        scalars: {
          timestamptz: "string",
          uuid: "string",
        },
      },
    },
  },
};
