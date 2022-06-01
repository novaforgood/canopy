import { Fragment } from "react";

import { AppProps } from "next/app";
import router, { useRouter } from "next/router";

import { Profile_Role_Enum } from "../generated/graphql";
import { auth } from "../lib/firebase";
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
  const user = auth.currentUser;

  // If the user is not logged in, redirect to the login page.
  if (requiredAuthorizations.includes(AuthenticationStatus.LoggedIn) && !user) {
    router.push(`/login?redirect=${router.asPath}`);
  }

  // return original children if the user is logged ian.
  return <Fragment>{children}</Fragment>;
}
