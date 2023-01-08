import { forwardRef } from "react";

import { createText } from "@shopify/restyle";

import { Theme } from "../../theme";
import { LoadingSkeleton } from "../LoadingSkeleton";

import { Box } from "./Box";

const TextBase = createText<Theme>();

export type TextProps = React.ComponentProps<typeof TextBase> & {
  loading?: boolean;
  loadingWidth?: number;
};

export const Text = forwardRef<typeof TextBase, TextProps>((props, ref) => {
  const { children, loading, loadingWidth = 12, ...rest } = props;
  return (
    <TextBase {...props} ref={ref}>
      {loading ? "‎" : children}
      {loading && (
        // <Box backgroundColor="black" height="100%" width={20}></Box>
        <LoadingSkeleton width={loadingWidth} height="100%" />
      )}
    </TextBase>
  );
});
