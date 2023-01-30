import React, { forwardRef, useState } from "react";

import { createText, BorderProps, useTheme } from "@shopify/restyle";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";

import { Theme } from "../../theme";

import { Box, BoxProps } from "./Box";
import { Text } from "./Text";

const TextInputBase = createText<Theme, RNTextInputProps & BorderProps<Theme>>(
  RNTextInput
);

type TextInputBaseProps = React.ComponentPropsWithRef<typeof TextInputBase>;

export type TextInputProps = TextInputBaseProps &
  BoxProps & {
    label?: string;
  };

export const TextInput = forwardRef<TextInputProps, TextInputProps>(
  (props, ref) => {
    const theme = useTheme<Theme>();
    const { containerProps, textInputProps, otherProps } = extractProps(props);
    const { label } = otherProps;

    const [focused, setFocused] = useState(false);
    return (
      <Box {...containerProps}>
        {label && (
          <Text mb={1} variant="body1">
            {label}
          </Text>
        )}
        <Box
          borderColor={focused ? "black" : "gray500"}
          borderWidth={1}
          borderRadius="md"
          backgroundColor="white"
          width="100%"
        >
          <TextInputBase
            {...textInputProps}
            ref={ref}
            variant="body1"
            px={4}
            pt={3}
            pb={3}
            style={{ width: "100%" }}
            placeholderTextColor={theme.colors.gray400}
            onFocus={(e) => {
              setFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              textInputProps.onBlur?.(e);
            }}
          />
        </Box>
      </Box>
    );
  }
);

function extractProps(originalProps: TextInputProps) {
  const { label, ...rest } = originalProps;

  const otherProps = {
    label,
  } as const;

  const {
    width,
    height,
    maxWidth,
    maxHeight,
    mt,
    mb,
    ml,
    mr,
    mx,
    my,
    left,
    right,
    top,
    bottom,
    alignSelf,
    flex,
    ...textInputProps
  } = rest;

  const containerProps = {
    width,
    height,
    maxWidth,
    maxHeight,
    mt,
    mb,
    ml,
    mr,
    mx,
    my,
    left,
    right,
    top,
    bottom,
    alignSelf,
    flex,
  } as const;

  return { textInputProps, otherProps, containerProps } as const;
}
