import { useCallback, useEffect, useState } from "react";

import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { BxRefresh } from "../generated/icons/regular";
import { auth } from "../lib/firebase";

import { TwoThirdsPageLayout } from "./TwoThirdsPageLayout";

function VerifyYourEmail() {
  const router = useRouter();

  const [verified, setVerified] = useState(false);

  const [loadingResendVerification, setLoadingResendVerification] =
    useState(false);

  const sendVerification = useCallback(async () => {
    if (auth.currentUser) {
      if (auth.currentUser.emailVerified) {
        // Upsert user then redirect to home

        setVerified(true);

        await fetch(`/api/auth/upsertUserData`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        })
          .then(() => {
            router.push("/");
          })
          .catch((e) => {
            toast.error(e.message);
          });
      } else {
        await sendEmailVerification(auth.currentUser);
      }
    }
  }, [router]);

  useEffect(() => {
    // Send verification email
    sendVerification();
  }, [sendVerification]);

  return (
    <TwoThirdsPageLayout>
      <div className="h-screen flex flex-col items-start justify-center px-16 max-w-2xl">
        {verified ? (
          <>
            <Text variant="heading2">Email verified!</Text>
            <div className="h-8"></div>
            <Text>Redirecting to home...</Text>
          </>
        ) : (
          <>
            <Text variant="heading2">Verify your email</Text>
            <div className="h-8"></div>
            <Text>
              Please click on the confirmation link to your email:{" "}
              {auth.currentUser?.email} in order to proceed with account
              creation.
            </Text>
            <Text className="mt-4">
              {"Once you've verified your email, refresh this page to log in."}
            </Text>
            <div className="h-16"></div>
            <Button
              variant="primary"
              rounded
              onClick={() => {
                router.reload();
              }}
            >
              Refresh <BxRefresh className="h-6 w-6 ml-2 -mr-2" />
            </Button>
            <div className="h-2"></div>
            <Button
              variant="outline"
              rounded
              onClick={async () => {
                setLoadingResendVerification(true);
                await sendVerification()
                  .then(() => {
                    toast.success("Verification email re-sent!");
                  })
                  .catch((error) => {
                    toast.error(
                      `Error sending verification email: ${error.message}`
                    );
                  });

                setLoadingResendVerification(false);
              }}
            >
              Resend verification link
            </Button>
            <div className="h-40"></div>
          </>
        )}
      </div>
    </TwoThirdsPageLayout>
  );
}

const VerifyPage = () => {
  return (
    <div>
      <VerifyYourEmail />
    </div>
  );
};

export default VerifyPage;
