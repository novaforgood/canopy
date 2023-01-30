import { useCallback, useEffect, useState } from "react";

import {
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { AuthSessionResult } from "expo-auth-session";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  getAdditionalUserInfo,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
} from "firebase/auth";
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
import { BxlApple, BxlGoogle } from "../generated/icons/logos";
import {
  createUserWithEmailAndPassword,
  signInWithCredential,
  signOut,
} from "../lib/firebase";
import { HOST_URL } from "../lib/url";

import type { RootStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

WebBrowser.maybeCompleteAuthSession();

export function SignUpScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "SignUp">) {
  const [signingUp, setSigningUp] = useState(false);

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

    return signInWithCredential(credential).then(async (userCred) => {
      const idToken = await userCred.user.getIdToken();
      const shouldUpdateName = !!getAdditionalUserInfo(userCred)?.isNewUser;
      return fetch(`${HOST_URL}/api/auth/upsertUserData`, {
        method: "POST",
        headers: {
          ["Content-Type"]: "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          updateName: shouldUpdateName,
        }),
      });
    });
  }, []);

  useEffect(() => {
    if (response) {
      processResponse(response).catch((e) => {
        toast.error(e.message);
        setSigningUp(false);
        signOut();
      });
    }
  }, [processResponse, response]);

  const googleSignIn = async () => {
    // sign in with google and upsert data to our DB
    setSigningUp(true);
    await promptAsync()
      .then((response) => {
        if (response.type === "success") {
          return response;
        } else {
          throw new Error("Google sign in failed");
        }
      })
      .catch((e) => {
        toast.error(e.message);
        signOut();
        setSigningUp(false);
      });
  };

  const appleSignIn = async () => {
    setSigningUp(true);
    const nonce = Math.random().toString(36).substring(2, 10);
    await signInAsync({
      requestedScopes: [
        AppleAuthenticationScope.FULL_NAME,
        AppleAuthenticationScope.EMAIL,
      ],
    })
      .then((appleCredential) => {
        const { identityToken } = appleCredential;
        const provider = new OAuthProvider("apple.com");

        if (!identityToken) {
          throw new Error("Missing `identityToken`");
        }
        const credential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce,
        });
        return signInWithCredential(credential).then(async (userCred) => {
          const idToken = await userCred.user.getIdToken();
          const shouldUpdateName = !!getAdditionalUserInfo(userCred)?.isNewUser;
          return fetch(`${HOST_URL}/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              ["Content-Type"]: "application/json",
              authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              updateName: shouldUpdateName,
            }),
          });
        });
      })
      .catch((e) => {
        toast.error(e.message);
        signOut();
        setSigningUp(false);
      });
  };

  const signInManually = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    // sign in using firebase auth and upsert to our DB
    setSigningUp(true);
    createUserWithEmailAndPassword(email, password)
      .then(async (userCred) => {
        const isNewUser = getAdditionalUserInfo(userCred)?.isNewUser;

        if (!isNewUser) {
          // If not a new user, sign them out and tell them to log in
          toast.error(
            "Account already exists under this email. Please log in."
          );
          await signOut();
        } else {
          const user = userCred.user;
          const tokenResult = await user.getIdTokenResult();
          const name = `${firstName} ${lastName}`;
          await updateProfile(user, {
            displayName: name,
          });

          await fetch(`${HOST_URL}/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ updateName: true }),
          });
        }
      })
      .catch((e) => {
        if (e.message.includes("already-in-use")) {
          toast.error(
            "Account already exists under this email. Please log in."
          );
        } else {
          toast.error(e.message);
        }
        signOut();
      })
      .finally(() => {
        setSigningUp(false);
      });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  if (signingUp) {
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
          <Text variant="body1">Signing up...</Text>
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
              <Text variant="heading3">Sign up for Canopy</Text>
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

            <Box mt={4} />
            <TouchableOpacity onPress={appleSignIn}>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                py={2}
                borderRadius="md"
                borderWidth={1}
                borderColor="black"
              >
                <BxlApple color="black" height={24} width={24} />
                <Text variant="body1" ml={2}>
                  Sign in with Apple
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
            <Box flexDirection="row" width="100%">
              <TextInput
                flex={1}
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                ml={4}
                flex={1}
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </Box>

            <TextInput
              mt={4}
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              label="Password"
              mt={4}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <Button
              mt={8}
              onPress={() => {
                signInManually(email, password, firstName, lastName);
              }}
            >
              Sign in
            </Button>

            <Box flex={1} />
          </Box>
        </TouchableWithoutFeedback>
      </CustomKeyboardAvoidingView>
    </SafeAreaView>
  );
}
