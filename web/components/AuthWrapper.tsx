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

  if (requiresAuthentication && !user) {
    router.push(`/login?redirect=${path}`);
  }

  return user || !requiresAuthentication ? (
    <Fragment>{children}</Fragment>
  ) : null;
}
