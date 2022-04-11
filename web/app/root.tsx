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
import { requireEnv } from "./utils";
import tailwindStyles from "./generated/tw.css";
import { Provider } from "urql";
import { getUrqlClient } from "./api/urql";

export function links() {
  return [{ rel: "stylesheet", href: tailwindStyles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

// Put environment variables that should be exposed to the client here.
const EXPOSED_ENV_VARS = [] as const;

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

interface UrqlProviderProps {
  children: React.ReactNode;
}
function UrqlProvider({ children }: UrqlProviderProps) {
  const apiUrl = "";
  const accessToken = "";

  const urqlClient = useMemo(
    () => getUrqlClient(`${apiUrl}/v1/graphql`, accessToken),
    [accessToken, apiUrl]
  );
  return <Provider value={urqlClient}>{children}</Provider>;
}

export default function App() {
  const data = useLoaderData<LoaderData>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <UrqlProvider>
          <Outlet />
        </UrqlProvider>
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
