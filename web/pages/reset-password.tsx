import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Text, Input, Button } from "../components/atomic";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { sendPasswordResetEmail } from "../lib/firebase";
import { CustomPage } from "../types";

enum ResetPasswordStages {
  InputEmail = 0,
  SuccessfulReset = 1,
}

//TODO: Customize reset password pages with
//TODO: Incorporate loading UI when resending link
const ResetPasswordPage: CustomPage = () => {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState(ResetPasswordStages.InputEmail);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <TwoThirdsPageLayout>
      <div className="h-full flex flex-col items-start justify-center px-6 sm:px-16">
        <Text variant="heading2">Reset Password</Text>
        <div className="h-4" />
        {stage === ResetPasswordStages.InputEmail ? (
          <form>
            <Text>
              {
                "Type in your email and we'll send a link to reset your password with."
              }
            </Text>
            <div className="h-4" />
            <Input
              placeholder="example@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <div className="h-4" />
            <div className="flex space-x-4">
              <Button
                type="reset"
                size="small"
                variant="outline"
                onClick={() => {
                  router.back();
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  if (/^\S+@\S+\.\S+$/.test(email)) {
                    sendPasswordResetEmail(email)
                      .then(() => {
                        setStage(ResetPasswordStages.SuccessfulReset);
                        setError(null);
                      })
                      .catch((err) => {
                        toast.error(err.message);
                      });
                  } else {
                    toast.error("Please provide a valid email.");
                  }
                }}
              >
                Send Email
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Text>
              {
                "You should've received an email to reset your password. Once you've filled out that form, you can log in again! Didn't receive an email? "
              }
              <button
                onClick={() => {
                  setStage(ResetPasswordStages.InputEmail);
                }}
              >
                <Text className="text-green-700 hover:underline font-bold">
                  Resend the link.
                </Text>
              </button>
            </Text>
            <div className="h-4" />
            <Link href="/login">
              <a>
                <Button size="small">Log in</Button>
              </a>
            </Link>
          </>
        )}
        <div className="h-4" />
        <Text className="min-h-4 text-error">{error}</Text>
      </div>
    </TwoThirdsPageLayout>
  );
};

ResetPasswordPage.requiredAuthorizations = [];

export default ResetPasswordPage;
