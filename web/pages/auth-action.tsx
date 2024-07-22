import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { BxRefresh } from "../generated/icons/regular";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import {
  applyActionCode,
  getCurrentUser,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  sendPasswordResetEmail,
} from "../lib/firebase";
import { CustomPage } from "../types";

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function AuthAction() {
  const { redirectUsingQueryParam } = useRedirectUsingQueryParam();
  const router = useRouter();

  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("Processing...");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [continueUrl, setContinueUrl] = useState("");

  const currentUser = getCurrentUser();

  const handleResetPassword = useCallback(
    async (actionCode: string, continueUrl: string, lang: string) => {
      try {
        const email = await verifyPasswordResetCode(actionCode);
        setEmail(email);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        toast.error(`Reset Password Error: ${(error as Error).message}`);
      }
    },
    []
  );

  const handleRecoverEmail = useCallback(
    async (actionCode: string, lang: string) => {
      try {
        const info = await checkActionCode(actionCode);
        const restoredEmail = info.data.email;
        await applyActionCode(actionCode);
        setEmail(restoredEmail || "");
        setStatus("success");
        if (restoredEmail) {
          await sendPasswordResetEmail(restoredEmail);
        }
      } catch (error) {
        setStatus("error");
        toast.error(`Recover Email Error: ${(error as Error).message}`);
      }
    },
    []
  );

  const handleVerifyEmail = useCallback(
    async (actionCode: string, continueUrl: string, lang: string) => {
      try {
        await applyActionCode(actionCode);
        setStatus("success");
        if (currentUser) {
          setStatus("Processing...");
          await fetch(`/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${await currentUser.getIdToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ updateName: true }),
          })
            .then(async () => {
              await sleep(500);
              if (continueUrl) {
                window.location.href = continueUrl;
              } else {
                window.location.href = "/";
              }
            })
            .catch((e) => {
              toast.error(e.message);
            });
        } else {
          if (continueUrl) {
            window.location.href = continueUrl;
          } else {
            window.location.href = "/";
          }
        }
      } catch (error) {
        setStatus("error");
        toast.error(`Verification Error: ${(error as Error).message}`);
      }
    },
    [currentUser]
  );

  const handleAction = useCallback(
    async (
      mode: string,
      oobCode: string,
      continueUrl: string,
      lang: string
    ) => {
      switch (mode) {
        case "resetPassword":
          await handleResetPassword(oobCode, continueUrl, lang);
          break;
        case "recoverEmail":
          await handleRecoverEmail(oobCode, lang);
          break;
        case "verifyEmail":
          await handleVerifyEmail(oobCode, continueUrl, lang);
          break;
        default:
          setStatus("Error: Invalid mode");
      }
    },
    [handleRecoverEmail, handleResetPassword, handleVerifyEmail]
  );

  useEffect(() => {
    const { mode, oobCode, continueUrl, lang } = router.query;

    if (mode && oobCode) {
      setMode(mode as string);
      setActionCode(oobCode as string);
      setContinueUrl((continueUrl as string) || "");
      handleAction(
        mode as string,
        oobCode as string,
        (continueUrl as string) || "",
        (lang as string) || ""
      );
    }
  }, [handleAction, router.query]);

  const submitNewPassword = useCallback(async () => {
    try {
      await confirmPasswordReset(actionCode, newPassword);
      setStatus("success");
      toast.success("Password reset successful!");
    } catch (error) {
      setStatus("error");
      toast.error(`Password Reset Error: ${(error as Error).message}`);
    }
  }, [actionCode, newPassword]);

  const renderResetPassword = useCallback(() => {
    switch (status) {
      case "Processing...":
        return <Text>Verifying your request...</Text>;
      case "ready":
        return (
          <>
            <Text variant="heading2">Reset Your Password</Text>
            <div className="h-8"></div>
            <Text>Enter a new password for your account: {email}</Text>
            <div className="h-4"></div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitNewPassword();
              }}
            >
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className="rounded border p-2"
              />
              <div className="h-4"></div>
              <Button type="submit" variant="primary" rounded>
                Reset Password
              </Button>
            </form>
          </>
        );
      case "success":
        return (
          <>
            <Text variant="heading2">Password Reset Successful</Text>
            <div className="h-8"></div>
            <Text>
              Your password has been successfully reset. You can now log in with
              your new password.
            </Text>
          </>
        );
      case "error":
        return (
          <>
            <Text variant="heading2">Password Reset Error</Text>
            <div className="h-8"></div>
            <Text>
              Unable to reset password. The link may be invalid or expired.
              Please try requesting a new password reset.
            </Text>
          </>
        );
    }
  }, [status, email, newPassword, submitNewPassword]);

  const renderRecoverEmail = useCallback(() => {
    switch (status) {
      case "Processing...":
        return <Text>Processing your email recovery request...</Text>;
      case "success":
        return (
          <>
            <Text variant="heading2">Email Recovery Successful</Text>
            <div className="h-8"></div>
            <Text>Your email has been successfully restored to {email}.</Text>
            <div className="h-4"></div>
            <Text>
              For security reasons, we&apos;ve sent a password reset email to
              this address. Please check your inbox to set a new password.
            </Text>
          </>
        );
      case "error":
        return (
          <>
            <Text variant="heading2">Email Recovery Error</Text>
            <div className="h-8"></div>
            <Text>
              Unable to recover email. The link may be invalid or expired.
              Please contact support for assistance.
            </Text>
          </>
        );
    }
  }, [status, email]);

  const renderVerifyEmail = useCallback(() => {
    switch (status) {
      case "Processing...":
        return <Text>Verifying your email address...</Text>;
      case "success":
        return (
          <>
            <Text variant="heading2">Email Verification Successful</Text>
            <div className="h-8"></div>
            <Text>
              Your email address has been successfully verified. You can now use
              all features of your account.
            </Text>
            {continueUrl && (
              <>
                <div className="h-4"></div>
                <Text>Redirecting you to the application...</Text>
              </>
            )}
          </>
        );
      case "error":
        return (
          <>
            <Text variant="heading2">Email Verification Error</Text>
            <div className="h-8"></div>
            <Text>
              Unable to verify email. The link may be invalid or expired. Please
              try requesting a new verification email.
            </Text>
          </>
        );
    }
  }, [status, continueUrl]);

  const renderContent = useCallback(() => {
    switch (mode) {
      case "resetPassword":
        return renderResetPassword();
      case "recoverEmail":
        return renderRecoverEmail();
      case "verifyEmail":
        return renderVerifyEmail();
      default:
        return <Text>Invalid action mode.</Text>;
    }
  }, [mode, renderResetPassword, renderRecoverEmail, renderVerifyEmail]);

  return (
    <TwoThirdsPageLayout
      renderLeft={() => (
        <ImageSidebar
          imageSrc="/assets/sidebar/sidebar_butterfly.svg"
          imageAlt="butterfly"
          canGoBack={false}
        />
      )}
    >
      <div className="flex h-[calc(100dvh)] max-w-2xl flex-col items-start justify-center px-16">
        {renderContent()}
      </div>
    </TwoThirdsPageLayout>
  );
}

const AuthActionPage: CustomPage = () => {
  return (
    <div>
      <AuthAction />
    </div>
  );
};

AuthActionPage.requiredAuthorizations = [];

export default AuthActionPage;
