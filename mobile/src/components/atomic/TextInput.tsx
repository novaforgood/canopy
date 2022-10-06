import React, { forwardRef } from "react";
import {
  createBox,
  ColorProps,
  createText,
  BorderProps,
} from "@shopify/restyle";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from "react-native";
import { Theme } from "../../theme";

const TextInputBase = createText<Theme, RNTextInputProps & BorderProps<Theme>>(
  RNTextInput
);

type TextInputProps = React.ComponentPropsWithRef<typeof TextInputBase>;

export const TextInput = forwardRef<typeof TextInputBase, TextInputProps>(
  (props, ref) => {
    return (
      <TextInputBase
        {...props}
        ref={ref}
        px={4}
        py={4}
        variant="body1"
        borderColor={"green900"}
        borderWidth={1}
        borderRadius={8}
      />
    );
  }
);
