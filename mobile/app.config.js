const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const extrasWhitelist = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_APP_ID",
  "GRAPHQL_ENDPOINT",
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
  extra: filterEnvVariables(process.env),
};
