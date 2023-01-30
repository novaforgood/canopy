import { useCallback, useState } from "react";

import * as WebBrowser from "expo-web-browser";
import { sendEmailVerification } from "firebase/auth";
import { useAtom } from "jotai";
import { SafeAreaView } from "react-native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { toast } from "../components/CustomToast";
import { BxRefresh } from "../generated/icons/regular";
import { useForegroundEffect } from "../hooks/useForegroundEffect";
import { getCurrentUser } from "../lib/firebase";
import { sessionAtom } from "../lib/jotai";
import { HOST_URL } from "../lib/url";

import type { RootStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function VerifyEmailScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "SignIn">) {
  const [loadingResendVerification, setLoadingResendVerification] =
    useState(false);

  const [verified, setVerified] = useState(false);

  const currentUser = getCurrentUser();

  const [session, setSession] = useAtom(sessionAtom);

  const navigateIfVerified = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      await currentUser
        .reload()
        .catch((error) => toast.error(`Reload Error: ${error.message}`));

      if (currentUser.emailVerified) {
        setVerified(true);
        await sleep(500);
        // TODO: Make this less hacky?
        // This is a hack to force the app to re-render the RootNavigator
        setSession((prev) => prev);
      }
    }
  };

  useForegroundEffect(() => {
    navigateIfVerified();
  });

  return (
    <SafeAreaView style={{ overflow: "hidden" }}>
      <Box p={4}>
        {verified ? (
          <>
            <Text variant="heading3">Email verified!</Text>
            <Text mt={4} variant="body1">
              Navigating to home screen...
            </Text>
          </>
        ) : (
          <>
            <Text variant="heading3">Verify your email</Text>
            <Text mt={8} variant="body1">
              Please press "Send verification email", and then click the
              confirmation link sent to your email:{" "}
              <Text color="green800" textDecorationLine="underline">
                {currentUser?.email}
              </Text>{" "}
              in order to proceed with account creation.
            </Text>
            <Text mt={4} variant="body1">
              {
                "Once you've verified your email, refresh this screen if you are not automatically navigated to the app."
              }
            </Text>
            <Button
              mt={12}
              variant="primary"
              loading={loadingResendVerification}
              onPress={async () => {
                if (currentUser) {
                  setLoadingResendVerification(true);
                  await sendEmailVerification(currentUser)
                    .then(() => {
                      toast.success("Verification email sent!");
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
              Send verification email
            </Button>
            <Button
              mt={2}
              flexDirection="row"
              variant="outline"
              onPress={navigateIfVerified}
            >
              <Text variant="body1" color="black">
                Refresh screen
              </Text>
              <Box ml={1.5} mr={-1.5} height={18} width={18}>
                <BxRefresh height="100%" width="100%" color="black" />
              </Box>
            </Button>
          </>
        )}
      </Box>
    </SafeAreaView>
  );
}
