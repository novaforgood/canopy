import { NextPage } from "next";

// Pages can state if they need to be authenticated
export type CustomPage<P = {}> = NextPage<P> & {
  requiresAuthentication: boolean;
};
