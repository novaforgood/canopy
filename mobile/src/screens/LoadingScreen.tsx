import React from "react";

import { useAtom } from "jotai";
import { ActivityIndicator, SafeAreaView } from "react-native";

import { Box } from "../components/atomic/Box";
import { Text } from "../components/atomic/Text";
import { updatingAtom } from "../lib/jotai";
import { RootStackParamList } from "../navigation/types";

import type { StackScreenProps } from "@react-navigation/stack";

export const LoadingScreen = ({
  route,
}: StackScreenProps<RootStackParamList, "Loading">) => {
  const [isUpdating] = useAtom(updatingAtom);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        flex={1}
        backgroundColor="olive50"
        height="100%"
      >
        <ActivityIndicator size="large" />
        {isUpdating && (
          <Text variant="subheading2" mt={8}>
            Updating app...
          </Text>
        )}
      </Box>
    </SafeAreaView>
  );
};
