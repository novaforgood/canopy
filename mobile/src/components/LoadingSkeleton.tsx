import { useEffect } from "react";

import { useTheme } from "@shopify/restyle";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "../theme";

import { Box, BoxProps } from "./atomic/Box";

const AnimatedBox = Animated.createAnimatedComponent(Box);

export function LoadingSkeleton(props: BoxProps) {
  const animation = useSharedValue(0.5);

  useEffect(() => {
    animation.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
    console.log(animation.value);
  }, [animation]);

  const theme = useTheme<Theme>();

  const boxStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
  }));

  return (
    <AnimatedBox
      backgroundColor="gray100"
      {...props}
      style={[{ borderRadius: theme.borderRadii.md }, props.style, boxStyle]}
    />
  );
}
