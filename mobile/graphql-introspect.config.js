module.exports = {
  generates: {
    "./graphql.schema.json": {
      schema: [
        {
          [process.env.GRAPHQL_ENDPOINT]: {
            headers: {
              "x-hasura-admin-secret": process.env.GRAPHQL_ADMIN_SECRET,
              "x-hasura-role": "user",
            },
          },
        },
      ],
      plugins: ["introspection"],
    },
  },
};
