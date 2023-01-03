import { Box } from "./atomic/Box";
import { Text } from "./atomic/Text";
import { BxX } from "../generated/icons/regular";

export interface TagProps {
  text: string;
  onDeleteClick?: () => void;
  renderRightIcon?: () => React.ReactNode;
  variant?: "primary" | "outline";
}

export function Tag(props: TagProps) {
  const { text, renderRightIcon, onDeleteClick, variant = "primary" } = props;

  return (
    <Box backgroundColor="lime200" borderRadius="full" px={3} py={1}>
      <Text variant="body3Medium" color="olive700">
        {text}
      </Text>
      {renderRightIcon
        ? renderRightIcon()
        : onDeleteClick && (
            <BxX height={12} width={12} color="black" onPress={onDeleteClick} />
          )}
    </Box>
  );
}
