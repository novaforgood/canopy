import { auth } from "../lib/firebase";
import { AppProps } from "next/app";
import LoginPage from "../pages/login";
import router, { useRouter } from "next/router";
import { Fragment } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  requiresAuthentication?: boolean;
}
export default function AuthWrapper({
  children,
  requiresAuthentication = false,
}: AuthWrapperProps) {
  const router = useRouter();
  const user = auth.currentUser;
  const path = router.pathname.replace("/", "");

  // If the user is not logged in, redirect to the login page.
  if (requiresAuthentication && !user) {
    router.push(`/login?redirect=${path}`);
  }

  // return original children if the user is logged in.
  return user || !requiresAuthentication ? (
    <Fragment>{children}</Fragment>
  ) : null;
}
