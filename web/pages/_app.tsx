import type { AppProps } from "next/app";
import { useEffect, useMemo, useState } from "react";
import { getUrqlClient } from "../lib/urql";
import { Provider } from "urql";
import { auth } from "../lib/firebase";

interface UrqlProviderProps {
  children: React.ReactNode;
}
function UrqlProvider({ children }: UrqlProviderProps) {
  const [jwt, setJwt] = useState<string | null>(null);
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      setJwt(await user.getIdToken());
    } else {
      setJwt(null);
    }
  });

  const client = useMemo(() => getUrqlClient(jwt ?? ""), [jwt]);

  return <Provider value={client}>{children}</Provider>;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UrqlProvider>
      <Component {...pageProps} />
    </UrqlProvider>
  );
}

export default MyApp;
