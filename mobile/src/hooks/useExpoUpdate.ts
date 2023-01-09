import { useState, useCallback } from "react";

import * as Updates from "expo-updates";
import { useAtom } from "jotai";
import { Alert } from "react-native";

import { updatingAtom } from "../lib/jotai";

import { useForegroundEffect } from "./useForegroundEffect";

export function useExpoUpdate() {
  const [updating, setUpdating] = useAtom(updatingAtom);
  const [updateChecked, setUpdateChecked] = useState(false);

  const checkAndDownload = useCallback(() => {
    async function checkAndDownloadUpdate() {
      if (__DEV__) return;
      console.log("checking for updates");
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log("update available, updating...");
        setUpdating(true);

        // https://github.com/expo/expo/issues/14359
        try {
          await Updates.fetchUpdateAsync();
        } catch (e) {
          try {
            await Updates.fetchUpdateAsync();
          } catch (e) {
            Alert.alert("Something went wrong", `Update error: ${e}`, [
              {
                text: "Retry",
                onPress: checkAndDownloadUpdate,
              },
            ]);
          }
        }
        await Updates.reloadAsync();
      }
    }

    checkAndDownloadUpdate().finally(() => {
      console.log("update check complete");
      setUpdateChecked(true);
      setUpdating(false);
    });
  }, [setUpdating]);

  useForegroundEffect(checkAndDownload);

  return { updateChecked, updating };
}
