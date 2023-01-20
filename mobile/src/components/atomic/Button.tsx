import React, { forwardRef, ReactNode } from "react";

import {
  createBox,
  ColorProps,
  createText,
  BorderProps,
} from "@shopify/restyle";
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

import { Theme } from "../../theme";

import { Text, TextProps } from "./Text";

const ButtonBase = createBox<Theme, TouchableOpacityProps>(TouchableOpacity);

type ButtonVariant = "primary" | "outline" | "secondary";

type ButtonProps = React.ComponentPropsWithRef<typeof ButtonBase> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
  disabled?: boolean;
};

const VARIANT_STYLES: Record<
  ButtonVariant,
  {
    buttonProps: Partial<ButtonProps>;
    disabledButtonProps: Partial<ButtonProps>;
    textProps: Partial<Omit<TextProps, "ref">>;
    disabledTextProps: Partial<Omit<TextProps, "ref">>;
  }
> = {
  primary: {
    buttonProps: {
      borderColor: "green900",
      backgroundColor: "green900",
    },
    disabledButtonProps: {
      borderColor: "gray600",
      backgroundColor: "gray600",
    },
    textProps: {
      color: "white",
    },
    disabledTextProps: {
      color: "white",
    },
  },
  outline: {
    buttonProps: {
      borderColor: "green900",
      backgroundColor: "transparent",
    },
    disabledButtonProps: {
      borderColor: "gray600",
      backgroundColor: "transparent",
    },
    textProps: {
      color: "green900",
    },
    disabledTextProps: {
      color: "gray400",
    },
  },
  secondary: {
    buttonProps: {
      borderColor: "transparent",
      backgroundColor: "transparent",
    },
    disabledButtonProps: {
      borderColor: "transparent",
      backgroundColor: "transparent",
    },
    textProps: {
      color: "gray600",
      textDecorationLine: "underline",
    },
    disabledTextProps: {
      color: "gray400",
      textDecorationLine: "underline",
    },
  },
};

export const Button = forwardRef<typeof ButtonBase, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      children,
      loading = false,
      disabled = false,
      ...rest
    } = props;

    const isDisabled = disabled || loading;

    const { buttonProps, textProps, disabledButtonProps, disabledTextProps } =
      VARIANT_STYLES[variant];
    const actualButtonProps = isDisabled ? disabledButtonProps : buttonProps;
    const actualTextProps = isDisabled ? disabledTextProps : textProps;

    function getInside() {
      if (loading) {
        return (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "white" : "green900"}
          />
        );
      }

      if (typeof children === "string") {
        return (
          <Text variant="body1" color="white" {...actualTextProps}>
            {children}
          </Text>
        );
      }
      return children;
    }
    const inside = getInside();

    return (
      <ButtonBase
        {...rest}
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        ref={ref}
        px={size === "md" ? 6 : 4}
        py={size === "md" ? 3 : 1}
        borderWidth={1}
        borderRadius="md"
        disabled={isDisabled}
        {...actualButtonProps}
      >
        {inside}
      </ButtonBase>
    );
  }
);
