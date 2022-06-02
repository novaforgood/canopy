import { Fragment } from "react";

import { AppProps } from "next/app";
import router, { useRouter } from "next/router";

import { Profile_Role_Enum } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { getCurrentUser } from "../lib/firebase";
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
  if (requiredAuthorizations.includes(AuthenticationStatus.LoggedIn)) {
    const currentUser = getCurrentUser();
    if (!isLoggedIn) {
      const prefix = router.asPath.split("?")[0];
      if (prefix !== "/login") {
        router.push(`/login?redirect=${router.asPath}`);
        return null;
      }
    } else if (currentUser && currentUser.emailVerified === false) {
      const prefix = router.asPath.split("?")[0];
      if (prefix !== "/verify") {
        router.push({
          pathname: "/verify",
          query: { redirect: router.asPath },
        });
        return null;
      }
    }
  }

  // return original children if the user is logged ian.
  return <>{children}</>;
}
