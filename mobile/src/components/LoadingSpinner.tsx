import { ActivityIndicator } from "react-native";

import { Box } from "./atomic/Box";

export function LoadingSpinner() {
  return (
    <Box
      p={4}
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
    >
      <ActivityIndicator size="large" />
    </Box>
  );
}
