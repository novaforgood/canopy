import { NhostReactProvider } from "@nhost/react";
import { json, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useMemo } from "react";
import { getNhostClient } from "./api/nhost";
import { requireEnv } from "./utils";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

// Put environment variables that should be exposed to the client here.
const EXPOSED_ENV_VARS = ["NHOST_URL"] as const;

interface LoaderData {
  ENV: {
    [K in typeof EXPOSED_ENV_VARS[number]]: string;
  };
}

export async function loader() {
  return json({
    ENV: {
      // Env vars here
      ...EXPOSED_ENV_VARS.map((key) => [key, requireEnv(key)]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {}
      ),
    },
  });
}

export default function App() {
  const data = useLoaderData<LoaderData>();

  const nhostUrl = data.ENV.NHOST_URL;
  const nhost = useMemo(() => getNhostClient(nhostUrl), [nhostUrl]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <NhostReactProvider nhost={nhost}>
          <Outlet />
        </NhostReactProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
