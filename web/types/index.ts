import { NextPage } from "next";

import { RequiredAuthorization } from "./requiredAuthorization";

// Pages can state if they need to be authenticated
export type CustomPage<P = Record<string, unknown>> = NextPage<P> & {
  requiredAuthorizations?: RequiredAuthorization[];
  showFooter?: boolean;
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};
