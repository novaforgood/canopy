import React, { forwardRef } from "react";
import {
  createBox,
  ColorProps,
  createText,
  BorderProps,
} from "@shopify/restyle";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Theme } from "../../theme";
import { Text } from "./Text";

const ButtonBase = createBox<Theme, TouchableOpacityProps>(TouchableOpacity);

type ButtonProps = React.ComponentPropsWithRef<typeof ButtonBase>;

export const Button = forwardRef<typeof ButtonBase, ButtonProps>(
  (props, ref) => {
    return (
      <ButtonBase
        {...props}
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        ref={ref}
        px={4}
        py={4}
        borderColor={"green900"}
        backgroundColor={"green900"}
        borderWidth={1}
        borderRadius="md"
      >
        <Text variant="body1" color="white">
          {props.children}
        </Text>
      </ButtonBase>
    );
  }
);
