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
          await fetch(`/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${idToken}`,
            },
          });
          // await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        // toast.error(e.message);
        // handleError(e);
        console.log(e.message);
      })

      .finally(() => {
        setSigningIn(false);
      });
  };

  const signInManually = async (email: string, password: string) => {
    // sign in using firebase auth and upsert to our DB
    setSigningIn(true);
    console.log("trytng");
    signInWithEmailAndPassword(email, password)
      .then(async (userCred) => {
        console.log("success");
        if (!userCred.user.emailVerified) {
          // router.push({ pathname: "/verify", query: router.query });
        } else {
          const tokenResult = await userCred.user.getIdTokenResult();
          console.log(tokenResult);
          const { manifest } = Constants;

          const api =
            typeof manifest?.packagerOpts === `object` &&
            manifest.packagerOpts.dev
              ? manifest?.debuggerHost?.split(`:`).shift()?.concat(`:3000`)
              : `api.example.com`;

          console.log(`http://${api}/api/auth/upsertUserData`);
          await fetch(`http://${api}/api/auth/upsertUserData`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${tokenResult.token}`,
            },
          });
          // await redirectUsingQueryParam("/");
        }
      })
      .catch((e) => {
        // toast.error(e.code + ": " + e.message);
        console.log(e.message);
        signOut();
      })
      .finally(() => {
        setSigningIn(false);
      });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box padding={4}>
      <Box>
        <Text variant="heading3">Sign in to Canopy</Text>

        <Button
          onPress={() => {
            console.log("Pressed");
            googleSignIn();
          }}
        >
          Sign in with Google
        </Button>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mt={12}
        />
        <TextInput
          label="Password"
          mt={4}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <Button
          mt={16}
          onPress={() => {
            console.log("Pressed");
            signInManually(email, password);
          }}
        >
          Sign in
        </Button>
      </Box>
    </Box>
  );
}
