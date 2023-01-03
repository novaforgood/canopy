import { Pressable, TouchableOpacity } from "react-native";
import { Box } from "../../../components/atomic/Box";
import { Text } from "../../../components/atomic/Text";
import { ProfileImage } from "../../../components/ProfileImage";
import { Tag } from "../../../components/Tag";

interface ProfileCardProps {
  imageUrl?: string;
  name: string;
  subtitle?: string | null;
  descriptionTitle: string;
  tags?: string[];
  onPress?: () => void;
  id: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    name,
    subtitle,
    descriptionTitle,
    imageUrl,
    tags = [],
    onPress = () => {},
    id,
  } = props;

  const numTags = 3;
  const remainingTags = tags.length - numTags;
  const processedTags = tags.slice(0, numTags);
  if (remainingTags > 0) {
    processedTags.push(`+${remainingTags} more…`);
  }

  return (
    <TouchableOpacity onPress={onPress} style={{ overflow: "hidden" }}>
      <Box
        mb={4}
        flexDirection="row"
        alignItems="center"
        borderRadius="md"
        borderWidth={1}
        borderColor="gray400"
        backgroundColor="white"
        overflow="hidden"
      >
        <ProfileImage
          width="40%"
          rounded={false}
          borderTopLeftRadius="md"
          borderBottomLeftRadius="md"
          border={false}
          src={imageUrl}
          alt={name}
        />
        <Box flexDirection="column" alignItems="flex-start" px={4}>
          <Text variant="subheading1" color="gray900">
            {name}
          </Text>
          {subtitle && (
            <Text mt={1} color="gray900" variant="body2">
              {subtitle}
            </Text>
          )}
          <Text mt={4} variant="body2Medium">
            {descriptionTitle}
          </Text>
          <Box
            mt={1.5}
            width="100%"
            flexDirection="row"
            // flexWrap="wrap"
            overflow="hidden"
          >
            {processedTags.length > 0 ? (
              processedTags.map((tag, index) => (
                <Box mb={1} mr={1} key={index} overflow="hidden">
                  <Tag text={tag} variant="outline" />
                </Box>
              ))
            ) : (
              <Text color="gray500" variant="body1Italic">
                none
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
