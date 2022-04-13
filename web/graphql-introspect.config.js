module.exports = {
  schema: [
    {
      "https://mentorcenter-v3-dev.hasura.app/v1/graphql": {
        headers: {
          "x-hasura-admin-secret": process.env.GRAPHQL_ADMIN_SECRET,
          "x-hasura-role": "admin",
        },
      },
    },
  ],
  generates: {
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};
