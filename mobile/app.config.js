const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const runtimeVersion = 0; // Increase by 1 every time your update requires a new native build
const version = `1.0.${runtimeVersion}`; // Version that the user sees
const config = {
  name: process.env.APP_NAME,
  appId: process.env.APP_ID,
  scheme: process.env.APP_SCHEME,
};

const extrasWhitelist = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_WEB_CLIENT_ID",
  "FIREBASE_IOS_CLIENT_ID",
  "HOST_URL",
  "GRAPHQL_ENDPOINT",
  "GRAPHQL_WS_ENDPOINT",
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
    name: config.name,
    currentFullName: "@legitmaxwu/joincanopy",
    originalFullName: "@legitmaxwu/joincanopy",
    scheme: config.scheme,
    slug: "joincanopy",
    version: version.toString(),
    runtimeVersion: {
      policy: "sdkVersion",
    },
    extra: {
      ...filterEnvVariables(process.env),
      eas: {
        projectId: "dd7005bd-965b-4a62-8699-911938535b3c",
      },
    },
    updates: {
      url: "https://u.expo.dev/dd7005bd-965b-4a62-8699-911938535b3c",
    },
    icon: "./assets/images/app_icon.png",
    splash: {
      image: "./assets/images/splash.png",
      backgroundColor: "#D8DF7B",
    },
    ios: {
      bundleIdentifier: config.appId,
    },
  },
};
