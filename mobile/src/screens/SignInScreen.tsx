import type { StackScreenProps } from "@react-navigation/stack";
import { useState } from "react";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { TextInput } from "../components/atomic/TextInput";
import {
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
} from "../lib/firebase";
import type { RootStackParams } from "../types/navigation";
import Constants from "expo-constants";

export function SignInScreen({
  navigation,
}: StackScreenProps<RootStackParams, "SignIn">) {
  const [signingIn, setSigningIn] = useState(false);
  const googleSignIn = async () => {
    // sign in with google and upsert data to our DB
    setSigningIn(true);
    signInWithGoogle()
      .then(async (userCred) => {
        const isNewUser =
          userCred.user.metadata.creationTime ===
          userCred.user.metadata.lastSignInTime;

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
    <Box>
      <Box>
        <Text variant="heading1">Sign in</Text>
        <TextInput value={email} onChangeText={setEmail} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <Button
          onPress={() => {
            console.log("Pressed");
            signInManually(email, password);
          }}
        >
          Test
        </Button>
      </Box>
    </Box>
  );
}
