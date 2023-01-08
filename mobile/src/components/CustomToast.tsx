import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";

import Toast from "react-native-toast-message";

import { Theme } from "../theme";

import { Box } from "./atomic/Box";
import { Text } from "./atomic/Text";

/**
 * This should used at different places to trigger
 * an error, success or info level toast.
 */
export enum ToastLevel {
  Error = "c_error",
  Info = "c_info",
  Success = "c_success",
}

const COLOR_MAP: Record<ToastLevel, keyof Theme["colors"]> = {
  [ToastLevel.Error]: "systemError",
  [ToastLevel.Success]: "green600",
  [ToastLevel.Info]: "black",
} as const;

interface ToastProps {
  prefix?: string | JSX.Element;
  level?: ToastLevel;
  text?: string;
}

export const toast = {
  success: (text: string) => {
    Toast.hide();
    Toast.show({
      type: ToastLevel.Success,
      position: "top",
      text1: text,
      topOffset: 50,
      autoHide: true,
      props: {
        level: ToastLevel.Success,
        text: text,
      },
    });
  },
  error: (text: string) => {
    Toast.hide();
    Toast.show({
      type: ToastLevel.Error,
      position: "top",
      text1: text,
      topOffset: 50,
      autoHide: true,
      props: {
        level: ToastLevel.Error,
        text: text,
      },
    });
  },
};

/**
 * Custom toast UX. Takes a string which is shown as message and
 * an optional string/element as prefix component.
 * The background color is tied to error levels in order for standardization
 * and simplicity of use.
 * @param ToastProps
 * @returns
 */
function ToastComponent({
  level = ToastLevel.Error,
  text = "Something bad happened",
}: ToastProps): JSX.Element {
  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      flexDirection="row"
      justifyContent="center"
      maxWidth="100%"
      zIndex={100}
    >
      <Box width={5} height="100%" backgroundColor={COLOR_MAP[level]}></Box>

      <Box
        px={4}
        py={2}
        backgroundColor="white"
        shadowColor="black"
        shadowRadius={5}
        shadowOpacity={0.1}
        shadowOffset={{ width: 0, height: 0 }}
        elevation={2}
      >
        <Text variant="body1" textAlign={"center"} color="black">
          {text}
        </Text>
      </Box>

      <Box width={5} height="100%" backgroundColor="white"></Box>
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toastConfig: Record<string, (args: any) => ReactNode> = {
  [ToastLevel.Error]({ text1, type, props }) {
    return <ToastComponent text={text1} level={type} prefix={props.prefix} />;
  },
  [ToastLevel.Info]({ text1, type, props }) {
    return <ToastComponent text={text1} level={type} prefix={props.prefix} />;
  },
  [ToastLevel.Success]({ text1, type, props }) {
    return <ToastComponent text={text1} level={type} prefix={props.prefix} />;
  },
};

export function CustomToast() {
  return <Toast config={toastConfig} />;
}
