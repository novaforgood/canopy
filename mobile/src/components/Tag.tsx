import { Box } from "./atomic/Box";
import { Text } from "./atomic/Text";
import { BxX } from "../generated/icons/regular";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface TagProps {
  text: string;
  onDeleteClick?: () => void;
  renderRightIcon?: () => React.ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
}

export function Tag(props: TagProps) {
  const {
    text,
    renderRightIcon,
    onDeleteClick,
    variant = "primary",
    size = "md",
  } = props;

  return (
    <Box
      backgroundColor="lime200"
      borderRadius="full"
      px={3}
      py={1}
      flexDirection="row"
      alignItems="center"
    >
      <Text
        variant={size === "md" ? "body2Medium" : "body3Medium"}
        color="olive700"
      >
        {text}
      </Text>
      {renderRightIcon
        ? renderRightIcon()
        : onDeleteClick && (
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                onDeleteClick();
              }}
            >
              <BxX height={12} width={12} color="black" />
            </TouchableOpacity>
          )}
    </Box>
  );
}
