module.exports = {
  schema: [
    {
      [process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT]: {
        headers: {
          "x-hasura-admin-secret": process.env.GRAPHQL_ADMIN_SECRET,
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
