import { useCallback, useEffect, useState } from "react";

import { AuthSessionResult } from "expo-auth-session";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { getAdditionalUserInfo, GoogleAuthProvider } from "firebase/auth";
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { TextInput } from "../components/atomic/TextInput";
import { CustomKeyboardAvoidingView } from "../components/CustomKeyboardAvoidingView";
import { toast } from "../components/CustomToast";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { BxlGoogle } from "../generated/icons/logos";
import {
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
} from "../lib/firebase";
import { HOST_URL } from "../lib/url";

import type { RootStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

WebBrowser.maybeCompleteAuthSession();

export function SignInScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "SignIn">) {
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = useIdTokenAuthRequest({
    iosClientId: Constants.expoConfig?.extra?.["FIREBASE_IOS_CLIENT_ID"] ?? "",
    clientId: Constants.expoConfig?.extra?.["FIREBASE_WEB_CLIENT_ID"] ?? "",
  });

  const processResponse = useCallback(async (response: AuthSessionResult) => {
    if (response.type !== "success") {
      throw new Error("Failed to sign in with Google");
    }
    if (!response.authentication) {
      throw new Error("Missing `response.authentication`");
    }

    const credential = GoogleAuthProvider.credential(
      response.authentication.idToken
    );

    signInWithCredential(credential).then(async (userCred) => {
      const isNewUser = getAdditionalUserInfo(userCred)?.isNewUser;

      if (isNewUser) {
        // User has never signed in before
        await userCred.user.delete();
        throw new Error("Account not created yet. Please sign up first!");
      } else if (!userCred.user.emailVerified) {
        // User has signed in before but has not verified email
        // router.push({ pathname: "/verify", query: router.query });
      } else {
        const idToken = await userCred.user.getIdToken();
        const res = await fetch(`${HOST_URL}/api/auth/upsertUserData`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        });

        // await redirectUsingQueryParam("/");
      }
    });
  }, []);

  useEffect(() => {
    if (response) {
      console.log(response);
      processResponse(response).catch((e) => {
        toast.error(e.message);
        signOut();
        setSigningIn(false);
      });
    }
  }, [processResponse, response]);

  const googleSignIn = async () => {
    // sign in with google and upsert data to our DB
    setSigningIn(true);
    await promptAsync().then((response) => {
      if (response.type === "success") {
        console.log("res", response);
        return response;
      } else {
        throw new Error("Google sign in failed");
      }
    });
  };

  const signInManually = async (email: string, password: string) => {
    // sign in using firebase auth and upsert to our DB
    setSigningIn(true);
    signInWithEmailAndPassword(email, password)
      .then(async (userCred) => {
        if (!userCred.user.emailVerified) {
          // router.push({ pathname: "/verify", query: router.query });
          // Linking.openURL(`${HOST_URL}/verify`)
          throw new Error("Please verify your email first!");
        } else {
          const tokenResult = await userCred.user.getIdTokenResult();

          await fetch(`${HOST_URL}/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
            },
          });
          // await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        toast.error(e.message);
        signOut();
      })
      .finally(() => {
        setSigningIn(false);
      });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (signingIn) {
    return (
      <SafeAreaView>
        <Box
          height="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Box mb={4} height={40}>
            <LoadingSpinner />
          </Box>
          <Text variant="body1">Signing in...</Text>
        </Box>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ overflow: "hidden" }}>
      <CustomKeyboardAvoidingView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box
            padding={4}
            height="100%"
            flexDirection="column"
            justifyContent="flex-end"
          >
            <Box mt={16}>
              <Text variant="heading3">Sign in to Canopy</Text>
            </Box>
            <Box mt={8} />
            <TouchableOpacity onPress={googleSignIn}>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                py={2}
                borderRadius="md"
                borderWidth={1}
                borderColor="black"
              >
                <BxlGoogle color="black" height={24} width={24} />
                <Text variant="body1" ml={2}>
                  Sign in with Google
                </Text>
              </Box>
            </TouchableOpacity>
            <Box
              my={8}
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <Box height={1} backgroundColor="gray600" flex={1}></Box>
              <Text variant="body1" mx={4} color="gray600">
                or
              </Text>
              <Box height={1} backgroundColor="gray600" flex={1}></Box>
            </Box>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              onBlur={() => Keyboard.dismiss()}
            />
            <TextInput
              label="Password"
              mt={4}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              onBlur={() => Keyboard.dismiss()}
            />
            <Button
              mt={8}
              onPress={() => {
                signInManually(email, password);
              }}
            >
              Sign in
            </Button>
            <Box mt={2}>
              <Text variant="body1" color="gray800" mt={4}>
                Don't have an account?{" "}
                <Text
                  variant="body1Medium"
                  color="green700"
                  textDecorationLine="underline"
                  onPress={() => {
                    Linking.openURL(`${HOST_URL}/signup`);
                  }}
                >
                  Sign up
                </Text>
              </Text>
            </Box>
            <Box flex={1} />
          </Box>
        </TouchableWithoutFeedback>
      </CustomKeyboardAvoidingView>
    </SafeAreaView>
  );
}
