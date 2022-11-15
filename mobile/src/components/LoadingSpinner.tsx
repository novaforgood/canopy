import { ActivityIndicator } from "react-native";
import { Box } from "./atomic/Box";

export function LoadingSpinner() {
  return (
    <Box p={4}>
      <ActivityIndicator size="large" />
    </Box>
  );
}
