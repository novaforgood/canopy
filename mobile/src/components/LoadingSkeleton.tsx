import { useEffect } from "react";

import { useTheme } from "@shopify/restyle";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "../theme";

import { Box, BoxProps } from "./atomic/Box";

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function LoadingSkeleton(props: BoxProps) {
  const opacity = useSharedValue(0.5);
  const theme = useTheme<Theme>();

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
  }, [opacity]);

  const boxStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedBox
      backgroundColor="gray200"
      borderRadius="md"
      {...props}
      style={[props.style, boxStyle]}
    />
  );
}
