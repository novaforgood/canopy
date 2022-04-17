import type { AppProps } from "next/app";
import { useMemo, useState } from "react";
import { getUrqlClient } from "../lib/urql";
import { Provider } from "urql";
import { auth } from "../lib/firebase";
import "../styles/globals.css";

interface UrqlProviderProps {
  children: React.ReactNode;
}
function UrqlProvider({ children }: UrqlProviderProps) {
  const [jwt, setJwt] = useState<string | null>(null);
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const tokenResult = await user.getIdTokenResult();
      const claims = tokenResult.claims["https://hasura.io/jwt/claims"];
      if (!claims) {
        // New user has logged in but doesn't have JWT claims
        await fetch(`/api/auth/updateJwt`, {
          headers: {
            authorization: `Bearer ${tokenResult.token}`,
          },
        });
        await auth.currentUser?.getIdToken(true);
      }

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
