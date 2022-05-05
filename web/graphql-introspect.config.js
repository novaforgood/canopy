module.exports = {
  generates: {
    "./graphql.schema.json": {
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
      plugins: ["introspection"],
    },
    "./graphql-admin.schema.json": {
      schema: [
        {
          [process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT]: {
            headers: {
              "x-hasura-admin-secret": process.env.GRAPHQL_ADMIN_SECRET,
              "x-hasura-role": "admin",
            },
          },
        },
      ],
      plugins: ["introspection"],
    },
  },
};
