import React, { forwardRef } from "react";
import {
  createBox,
  ColorProps,
  createText,
  BorderProps,
} from "@shopify/restyle";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Theme } from "../../theme";
import { Text, TextProps } from "./Text";

const ButtonBase = createBox<Theme, TouchableOpacityProps>(TouchableOpacity);

type ButtonVariant = "primary" | "outline";

type ButtonProps = React.ComponentPropsWithRef<typeof ButtonBase> & {
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<
  ButtonVariant,
  { buttonProps: Partial<ButtonProps>; textProps: Partial<TextProps> }
> = {
  primary: {
    buttonProps: {
      borderColor: "green900",
      backgroundColor: "green900",
    },
    textProps: {
      color: "white",
    },
  },
  outline: {
    buttonProps: {
      borderColor: "green900",
      backgroundColor: "transparent",
    },
    textProps: {
      color: "green900",
    },
  },
};

export const Button = forwardRef<typeof ButtonBase, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", children, ...rest } = props;

    const { buttonProps, textProps } = VARIANT_STYLES[variant];
    return (
      <ButtonBase
        {...rest}
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        ref={ref}
        px={6}
        py={3}
        borderWidth={1}
        borderRadius="md"
        {...buttonProps}
      >
        <Text variant="body1" color="white" {...textProps}>
          {children}
        </Text>
      </ButtonBase>
    );
  }
);
