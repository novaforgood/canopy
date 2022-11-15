import type { StackScreenProps } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { TextInput } from "../components/atomic/TextInput";
import {
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
} from "../lib/firebase";
import type { RootStackParamList } from "../navigation/types";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { getAdditionalUserInfo, GoogleAuthProvider } from "firebase/auth";
import { HOST_URL } from "../lib/url";
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { BxlGoogle } from "../generated/icons/logos";
import { CustomKeyboardAvoidingView } from "../components/CustomKeyboardAvoidingView";
import { toast } from "../components/CustomToast";

WebBrowser.maybeCompleteAuthSession();

export function SignInScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "SignIn">) {
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Constants.manifest?.extra?.["FIREBASE_WEB_CLIENT_ID"] ?? "",
  });

  const googleSignIn = async () => {
    // sign in with google and upsert data to our DB
    setSigningIn(true);
    await promptAsync()
      .then(async (response) => {
        if (response.type === "success") {
          const idToken = response.params.id_token;
          return GoogleAuthProvider.credential(idToken);
        } else {
          throw new Error("Google sign in failed");
        }
      })
      .then(signInWithCredential)
      .then(async (userCred) => {
        const isNewUser = getAdditionalUserInfo(userCred)?.isNewUser;

        if (isNewUser) {
          // User has never signed in before
          await userCred.user.delete();
          // toast.error("Account not created yet. Please sign up first!");
        } else if (!userCred.user.emailVerified) {
          // User has signed in before but has not verified email
          // router.push({ pathname: "/verify", query: router.query });
        } else {
          const idToken = await userCred.user.getIdToken();
          await fetch(`${HOST_URL}/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${idToken}`,
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
