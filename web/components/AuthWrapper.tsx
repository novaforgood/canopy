import { Fragment } from "react";

import { AppProps } from "next/app";
import router, { useRouter } from "next/router";

import { auth } from "../lib/firebase";
import LoginPage from "../pages/login";

interface AuthWrapperProps {
  children: React.ReactNode;
  requiresAuthentication?: boolean;
}
export default function AuthWrapper({
  children,
  requiresAuthentication = false,
}: AuthWrapperProps) {
  return children;
  // const router = useRouter();
  // const user = auth.currentUser;
  // // const path = router.pathname.replace("/", "");

  // // If the user is not logged in, redirect to the login page.
  // // if (requiresAuthentication && !user) {
  // //   router.push(`/login?redirect=${path}`);
  // // }

  // if (user && !user.emailVerified) {
  //   router.push("/verify");
  //   return <Fragment>{children}</Fragment>;
  // }

  // // return original children if the user is logged in.
  // return user || !requiresAuthentication ? (
  //   <Fragment>{children}</Fragment>
  // ) : null;
}
