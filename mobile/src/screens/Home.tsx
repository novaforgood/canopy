import { Button, View } from "react-native";
import { Box } from "../components/atomic/Box";
import { Text } from "../components/atomic/Text";

function HomeScreen({ navigation }) {
  const spaces = [
    { name: "Propel Water Lovers", id: "we-love-propel" },
    { name: "Propel Water Haters", id: "no-propel-water" },
    { name: "Ae", id: "ae" },
  ];

  return (
    <View>
      <Box backgroundColor="olive100" height="100%">
        <Text variant="subheading1" padding={4}>
          Welcome to Canopy Mobile!
        </Text>
        {spaces.map((item) => (
          <Button
            title={item.name}
            key={item.id}
            onPress={() =>
              navigation.navigate("Directory", {
                spaceid: item.id,
                spaceName: item.name,
              })
            }
          />
        ))}
      </Box>
    </View>
  );
}

export default HomeScreen;
