import { useCallback, useEffect, useMemo, useState } from "react";

import { useWindowEvent } from "@mantine/hooks";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { BxRefresh } from "../generated/icons/regular";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { applyActionCode, getCurrentUser } from "../lib/firebase";
import { CustomPage } from "../types";
import { requireEnv } from "../lib/env";

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function VerifyYourEmail() {
  const { redirectUsingQueryParam } = useRedirectUsingQueryParam();
  const router = useRouter();

  const [verified, setVerified] = useState(false);
  const [loadingResendVerification, setLoadingResendVerification] =
    useState(false);

  const currentUser = getCurrentUser();

  const emailVerificationOptions = useMemo(() => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    return {
      url: `${baseUrl}${(router.query.redirect as string) ?? "/"}`,
    };
  }, [router.query.redirect]);

  console.log(emailVerificationOptions);

  useWindowEvent("focus", async () => {
    currentUser
      ?.reload()
      .then(() => {
        if (currentUser.emailVerified) {
          redirectAfterVerification();
        }
      })
      // not sure what to do here - error with reload() has only happened once
      .catch((error) => toast.error(`Reload Error: ${error.message}`));
  });

  const redirectAfterVerification = useCallback(async () => {
    if (currentUser) {
      setVerified(true);

      await fetch(`/api/auth/upsertUserData`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${await currentUser.getIdToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateName: true }),
      })
        .then(async () => {
          // wait half a second before redirecting to show verified screen
          await sleep(500);
          return redirectUsingQueryParam("/");
        })
        .catch((e) => {
          toast.error(e.message);
        });
    }
  }, [redirectUsingQueryParam, currentUser]);

  useEffect(() => {
    const { oobCode, mode } = router.query;
    if (!currentUser) return;

    if (oobCode && typeof oobCode === "string" && mode === "verifyEmail") {
      applyActionCode(oobCode)
        .then(() => {
          setVerified(true);
          redirectAfterVerification();
        })
        .catch((error) => {
          toast.error(`Verification Error: ${error.message}`);
        });
    }
  }, [currentUser, redirectAfterVerification, router.query]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.emailVerified) {
        redirectAfterVerification();
      } else {
        // ignore too-many-requests error caused by resending request every page refresh (oops)
        // TODO: only send verification email first time, and not on every page reload
        sendEmailVerification(currentUser, emailVerificationOptions).catch(
          (error) => {
            toast.error(
              error.message.includes("too-many-requests")
                ? "Please wait until sending another verification email."
                : `Error sending verification email: ${error.message}`
            );
          }
        );
      }
    }
  }, [redirectAfterVerification, currentUser, emailVerificationOptions]);

  console.log(requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"));
  return (
    <TwoThirdsPageLayout
      renderLeft={() => {
        return (
          <ImageSidebar
            imageSrc="/assets/sidebar/sidebar_butterfly.svg"
            imageAlt="butterfly"
            canGoBack={false}
          />
        );
      }}
    >
      <div className="flex h-[calc(100dvh)] max-w-2xl flex-col items-start justify-center px-16">
        {verified ? (
          <>
            <Text variant="heading2">Email verified!</Text>
            <div className="h-8"></div>
            <Text>Redirecting...</Text>
          </>
        ) : (
          <>
            <Text variant="heading2">Verify your email</Text>
            <div className="h-8"></div>
            <Text>
              Please click on the confirmation link to your email:{" "}
              <Text underline className="text-green-800">
                {currentUser?.email}
              </Text>{" "}
              in order to proceed with account creation.
            </Text>
            <Text className="mt-4">
              {
                "Once you've verified your email, refresh this page if you are not automatically redirected."
              }
            </Text>
            <div className="h-16"></div>
            <Button
              variant="primary"
              rounded
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh <BxRefresh className="ml-2 -mr-2 h-6 w-6" />
            </Button>
            <div className="h-2"></div>
            <Button
              variant="outline"
              rounded
              loading={loadingResendVerification}
              onClick={async () => {
                if (currentUser) {
                  setLoadingResendVerification(true);
                  await sendEmailVerification(
                    currentUser,
                    emailVerificationOptions
                  )
                    .then(() => {
                      toast.success("Verification email re-sent!");
                    })
                    .catch((error) => {
                      toast.error(
                        error.message.includes("too-many-requests")
                          ? "Please wait until sending another verification email."
                          : `Error sending verification email: ${error.message}`
                      );
                    });

                  setLoadingResendVerification(false);
                }
              }}
            >
              Resend verification email
            </Button>
            <div className="h-40"></div>
          </>
        )}
      </div>
    </TwoThirdsPageLayout>
  );
}

const VerifyPage: CustomPage = () => {
  return (
    <div>
      <VerifyYourEmail />
    </div>
  );
};

VerifyPage.requiredAuthorizations = [];

export default VerifyPage;
