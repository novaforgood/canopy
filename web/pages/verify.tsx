import { useCallback, useEffect, useState } from "react";

import { useWindowEvent } from "@mantine/hooks";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { TwoThirdsPageLayout } from "../components/TwoThirdsPageLayout";
import { BxRefresh } from "../generated/icons/regular";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { getCurrentUser } from "../lib/firebase";
import { CustomPage } from "../types";

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function VerifyYourEmail() {
  const router = useRouter();

  const { redirectUsingQueryParam } = useRedirectUsingQueryParam();

  const [verified, setVerified] = useState(false);
  const [loadingResendVerification, setLoadingResendVerification] =
    useState(false);

  const currentUser = getCurrentUser();

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
        },
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
    if (currentUser) {
      if (currentUser.emailVerified) {
        redirectAfterVerification();
      } else {
        // ignore too-many-requests error caused by resending request every page refresh (oops)
        // TODO: only send verification email first time, and not on every page reload
        sendEmailVerification(currentUser).catch(() => {});
      }
    }
  }, [redirectAfterVerification, currentUser]);

  return (
    <TwoThirdsPageLayout>
      <div className="h-screen flex flex-col items-start justify-center px-16 max-w-2xl">
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
              {currentUser?.email} in order to proceed with account creation.
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
              Refresh <BxRefresh className="h-6 w-6 ml-2 -mr-2" />
            </Button>
            <div className="h-2"></div>
            <Button
              variant="outline"
              rounded
              loading={loadingResendVerification}
              onClick={async () => {
                if (currentUser) {
                  setLoadingResendVerification(true);
                  await sendEmailVerification(currentUser)
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
