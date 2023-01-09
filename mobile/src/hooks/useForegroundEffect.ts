import { useEffect, useRef } from "react";

import { AppState } from "react-native";

import type { AppStateStatus } from "react-native";

export const useForegroundEffect = (effect: () => (() => void) | void) => {
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    let cancel: (() => void) | void;
    const listener = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
        cancel = effect();
      }

      appState.current = nextAppState;
    };

    AppState.addEventListener("change", listener);
    return () => {
      AppState.removeEventListener("change", listener);
      if (cancel) cancel();
    };
  }, [effect]);

  useEffect(() => {
    effect();
  }, [effect]);
};
