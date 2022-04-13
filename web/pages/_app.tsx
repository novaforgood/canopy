import type { AppProps } from "next/app";
import { useMemo } from "react";
import { urqlClient } from "../lib/urql";
import { Provider } from "urql";

interface UrqlProviderProps {
  children: React.ReactNode;
}
function UrqlProvider({ children }: UrqlProviderProps) {
  return <Provider value={urqlClient}>{children}</Provider>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UrqlProvider>
      <Component {...pageProps} />
    </UrqlProvider>
  );
}

export default MyApp;
