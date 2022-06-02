import { Fragment } from "react";

import { AppProps } from "next/app";
import router, { useRouter } from "next/router";

import { Profile_Role_Enum } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import LoginPage from "../pages/login";

import {
  AuthenticationStatus,
  RequiredAuthorization,
} from "./requiredAuthorization";

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredAuthorizations?: RequiredAuthorization[];
}
export default function AuthWrapper({
  children,
  requiredAuthorizations = [AuthenticationStatus.LoggedIn],
}: AuthWrapperProps) {
  const router = useRouter();

  const isLoggedIn = useIsLoggedIn();

  // If the user is not logged in, redirect to the login page.
  if (
    requiredAuthorizations.includes(AuthenticationStatus.LoggedIn) &&
    !isLoggedIn
  ) {
    const prefix = router.asPath.split("?")[0];
    if (prefix !== "/login") {
      router.push(`/login?redirect=${router.asPath}`);
      return <div>Redirecting to login...</div>;
    }
  }

  // return original children if the user is logged ian.
  return <Fragment>{children}</Fragment>;
}
