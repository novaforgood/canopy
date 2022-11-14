import Constants from "expo-constants";
export function getGraphqlEndpoint() {
  const url = Constants.manifest?.extra?.["GRAPHQL_ENDPOINT"];

  if (url.includes("localhost")) {
    const apiUrl = url.replace(
      "localhost",
      Constants.manifest?.debuggerHost?.split(`:`)[0]
    );
    console.log("getGraphqlEndpoint. Localhost. Url:", apiUrl);
    return apiUrl;
  } else {
    return url;
  }
}

export function getGraphqlWsEndpoint() {
  const url = Constants.manifest?.extra?.["GRAPHQL_WS_ENDPOINT"];

  if (url.includes("localhost")) {
    const apiUrl = url.replace(
      "localhost",
      Constants.manifest?.debuggerHost?.split(`:`)[0]
    );
    console.log("getGraphqlEndpoint. Localhost. Url:", apiUrl);
    return apiUrl;
  } else {
    return url;
  }
}
