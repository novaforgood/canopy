import React, { forwardRef } from "react";
import { createText, BorderProps } from "@shopify/restyle";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { Theme } from "../../theme";
import { Text } from "./Text";
import { Box, BoxProps } from "./Box";

const TextInputBase = createText<Theme, RNTextInputProps & BorderProps<Theme>>(
  RNTextInput
);

type TextInputBaseProps = React.ComponentPropsWithRef<typeof TextInputBase>;

type TextInputProps = TextInputBaseProps &
  BoxProps & {
    label?: string;
  };

export const TextInput = forwardRef<TextInputProps, TextInputProps>(
  (props, ref) => {
    const { containerProps, textInputProps, otherProps } = extractProps(props);
    const { label } = otherProps;
    return (
      <Box {...containerProps}>
        {label && (
          <Text mb={1} variant="body1">
            {label}
          </Text>
        )}
        <Box
          borderColor={"green900"}
          borderWidth={1}
          borderRadius="md"
          px={4}
          py={2}
          pt={1}
          backgroundColor="white"
        >
          <TextInputBase {...textInputProps} ref={ref} variant="body1" />
        </Box>
      </Box>
    );
  }
);

function extractProps(originalProps: TextInputProps) {
  const { label, ...rest } = originalProps;

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
    ...textInputProps
  } = rest;

  const otherProps = {
    label,
  };

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
  };
  return { textInputProps, otherProps, containerProps } as const;
}
