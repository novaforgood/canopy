const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const extrasWhitelist = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_APP_ID",
  "GRAPHQL_ENDPOINT",
  "GRAPHQL_WS_ENDPOINT",
  "FIREBASE_WEB_CLIENT_ID",
];

function filterEnvVariables(env) {
  return Object.keys(env)
    .filter((key) => extrasWhitelist.includes(key))
    .reduce((obj, key) => {
      obj[key] = env[key];
      return obj;
    }, {});
}

export default {
  expo: {
    name: "Canopy",
    slug: "joincanopy",
    extra: filterEnvVariables(process.env),
  },
};
