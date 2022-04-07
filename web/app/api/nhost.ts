import { NhostClient } from "@nhost/nhost-js";

const nhost = new NhostClient({
  // backendUrl: "https://uqnwieepllnfnbxmwlro.nhost.run", // replace this with the backend URL of your app
  backendUrl: "http://localhost:1337",
});

export { nhost };
