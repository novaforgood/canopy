import type { StackScreenProps } from "@react-navigation/stack";
import { Button, Text, View } from "react-native";
import type { RootStackParams } from "../types/navigation";

function HomeScreen({ navigation }: StackScreenProps<RootStackParams, "Home">) {
  const spaces = [{ spaceSlug: "test-space-1", spaceName: "Test Space 1" }];

  return (
    <View>
      <View>
        <Text>Welcome to Canopy Mobile!</Text>
        {spaces.map((item) => (
          <Button
            title={item.spaceName}
            key={item.spaceSlug}
            onPress={() =>
              navigation.navigate("Directory", {
                spaceSlug: item.spaceSlug,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}

export default HomeScreen;
