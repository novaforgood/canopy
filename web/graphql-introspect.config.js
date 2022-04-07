module.exports = {
  schema: [
    {
      "http://localhost:1337/v1/graphql": {
        headers: {
          "x-hasura-admin-secret": "nhost-admin-secret",
          "x-hasura-role": "user",
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
