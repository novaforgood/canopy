// AuthActionPage.tsx

import { useState, useEffect, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { TextInput } from "../components/inputs/TextInput";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import {
  applyActionCode,
  getCurrentUser,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  sendPasswordResetEmail,
} from "../lib/firebase";
import { CustomPage } from "../types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AuthAction = () => {
  const router = useRouter();

  // State variables
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("Processing...");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [continueUrl, setContinueUrl] = useState("");
  const [lang, setLang] = useState("");

  const [previousEmailAddress, setPreviousEmailAddress] = useState("");
  const [newEmailAddress, setNewEmailAddress] = useState("");

  // Handle reset password action
  const handleResetPassword = useCallback(async (actionCode: string) => {
    try {
      const email = await verifyPasswordResetCode(actionCode);
      setEmail(email);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      toast.error(`Reset Password Error: ${(error as Error).message}`);
    }
  }, []);

  // Handle recover email action
  const handleRecoverEmail = useCallback(async (actionCode: string) => {
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
  }, []);

  // Handle verify email action
  const handleVerifyEmail = useCallback(
    async (actionCode: string, continueUrl: string) => {
      try {
        await applyActionCode(actionCode);
        setStatus("success");

        const currentUser = getCurrentUser();
        // Optionally, reload user to get updated email
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
    []
  );

  // Handle verify and change email action
  const handleVerifyAndChangeEmail = useCallback(
    async (actionCode: string, continueUrl: string) => {
      try {
        const actionCodeInfo = await checkActionCode(actionCode);
        setPreviousEmailAddress(actionCodeInfo.data.previousEmail ?? "");
        setNewEmailAddress(actionCodeInfo.data.email ?? "");

        await applyActionCode(actionCode);
        const user = getCurrentUser();
        if (user) {
          await user.reload();
        }
        setStatus("success");
      } catch (error) {
        setStatus("error");
        toast.error(
          `Verification and Email Change Error: ${(error as Error).message}`
        );
      }
    },
    []
  );

  // Determine which action to handle based on the mode
  const handleAction = useCallback(
    async (mode: string, actionCode: string, continueUrl: string) => {
      switch (mode) {
        case "resetPassword":
          await handleResetPassword(actionCode);
          break;
        case "recoverEmail":
          await handleRecoverEmail(actionCode);
          break;
        case "verifyEmail":
          await handleVerifyEmail(actionCode, continueUrl);
          break;
        case "verifyAndChangeEmail":
          await handleVerifyAndChangeEmail(actionCode, continueUrl);
          break;
        default:
          setStatus("error");
          toast.error("Invalid action mode.");
      }
    },
    [
      handleResetPassword,
      handleRecoverEmail,
      handleVerifyEmail,
      handleVerifyAndChangeEmail,
    ]
  );

  // Extract query parameters and initiate the appropriate action
  useEffect(() => {
    const { mode, oobCode, continueUrl, lang } = router.query;

    if (mode && oobCode) {
      setMode(mode as string);
      setActionCode(oobCode as string);
      setContinueUrl((continueUrl as string) || "");
      setLang((lang as string) || "");
      handleAction(
        mode as string,
        oobCode as string,
        (continueUrl as string) || ""
      );
    } else {
      setStatus("error");
      toast.error("Invalid or missing action code parameters.");
    }
  }, [router.query, handleAction]);

  // Handle password reset submission
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

  // Render functions for different action modes
  const renderResetPassword = () => {
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
              <TextInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="h-4"></div>
              <Button type="submit" variant="primary">
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
            <div className="h-4"></div>
            <Link passHref href="/login">
              <Button variant="primary">Go to Login</Button>
            </Link>
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
      default:
        return null;
    }
  };

  const renderRecoverEmail = () => {
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
      default:
        return null;
    }
  };

  const renderVerifyEmail = () => {
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
      default:
        return null;
    }
  };

  const renderVerifyAndChangeEmail = () => {
    switch (status) {
      case "Processing...":
        return <Text>Verifying and updating your email address...</Text>;
      case "success":
        return (
          <>
            <Text variant="heading2">Email Verified and Updated</Text>
            <div className="h-8"></div>
            <Text>
              You have successfully changed your email from{" "}
              <b>{previousEmailAddress}</b> to <b>{newEmailAddress}</b>.
            </Text>
            <div className="h-4"></div>
            <Text>Please log in again with your new email address.</Text>
            <div className="h-8"></div>
            <Link passHref href="/login">
              <Button variant="primary">Go to Login Page</Button>
            </Link>
          </>
        );
      case "error":
        return (
          <>
            <Text variant="heading2">Email Verification and Update Error</Text>
            <div className="h-8"></div>
            <Text>
              Unable to verify and update email. The link may be invalid or
              expired. Please try requesting a new verification email or contact
              support for assistance.
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  // Determine which content to render based on the action mode
  const renderContent = () => {
    switch (mode) {
      case "resetPassword":
        return renderResetPassword();
      case "recoverEmail":
        return renderRecoverEmail();
      case "verifyEmail":
        return renderVerifyEmail();
      case "verifyAndChangeEmail":
        return renderVerifyAndChangeEmail();
      default:
        return <Text>Invalid action mode.</Text>;
    }
  };

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
      <div className="flex h-[calc(100vh)] max-w-2xl flex-col items-start justify-center px-16">
        {renderContent()}
      </div>
    </TwoThirdsPageLayout>
  );
};

const AuthActionPage: CustomPage = () => {
  return (
    <div>
      <AuthAction />
    </div>
  );
};

AuthActionPage.requiredAuthorizations = [];

export default AuthActionPage;
