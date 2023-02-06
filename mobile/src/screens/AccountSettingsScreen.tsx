import { useCallback, useState } from "react";

import * as WebBrowser from "expo-web-browser";
import { sendEmailVerification } from "firebase/auth";
import { useAtom } from "jotai";
import { Linking, SafeAreaView } from "react-native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import { toast } from "../components/CustomToast";
import { BxRefresh } from "../generated/icons/regular";
import { useForegroundEffect } from "../hooks/useForegroundEffect";
import { getCurrentUser } from "../lib/firebase";
import { forceRootNavRerenderAtom, sessionAtom } from "../lib/jotai";
import { HOST_URL } from "../lib/url";

import type { RootStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

export function AccountSettingsScreen({
  navigation,
}: StackScreenProps<RootStackParamList, "AccountSettings">) {
  return (
    <SafeAreaView style={{ overflow: "hidden" }}>
      <Box p={4}>
        <Button
          mt={8}
          variant="outline"
          onPress={() => {
            const url = `${HOST_URL}/delete-account`;
            Linking.openURL(url);
          }}
        >
          Delete Account
        </Button>
      </Box>
    </SafeAreaView>
  );
}
