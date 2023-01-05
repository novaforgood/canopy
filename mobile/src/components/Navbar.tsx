import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

import { useCurrentSpace } from "../hooks/useCurrentSpace";

import { Box } from "./atomic/Box";
import { Text } from "./atomic/Text";

export function Navbar() {
  const navigation = useNavigation();
  const { currentSpace } = useCurrentSpace();
  return (
    <Box>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Text>Back</Text>
      </TouchableOpacity>
      <Text>{currentSpace?.name}</Text>
    </Box>
  );
}
