import Constants from "expo-constants";

const DEBUGGER_HOST_IP =
  Constants.manifest2?.extra?.expoGo?.debuggerHost?.split(`:`)[0] ?? "";

function replaceLocalhostWithIp(url: string) {
  if (!url || url.length === 0) {
    throw new Error("url is empty");
  }
  if (url.includes("://localhost")) {
    return url.replace(`localhost`, DEBUGGER_HOST_IP);
  } else {
    return url;
  }
}

export const HOST_URL = replaceLocalhostWithIp(
  Constants.expoConfig?.extra?.HOST_URL
);

export const GRAPHQL_ENDPOINT = replaceLocalhostWithIp(
  Constants.expoConfig?.extra?.GRAPHQL_ENDPOINT
);

export const GRAPHQL_WS_ENDPOINT = replaceLocalhostWithIp(
  Constants.expoConfig?.extra?.GRAPHQL_WS_ENDPOINT
);
