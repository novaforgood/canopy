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
        mb={3}
        flexDirection="row"
        alignItems="center"
        borderRadius="md"
        backgroundColor="white"
        shadowColor="black"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.1}
        shadowRadius={1}
        elevation={1}
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
        <Box flexDirection="column" alignItems="flex-start" px={4} flex={1}>
          <Text variant="subheading1" color="gray900">
            {name}
          </Text>
          {subtitle && (
            <Text numberOfLines={2} mt={1} color="gray900" variant="body2">
              {subtitle}
            </Text>
          )}

          <Box
            mt={4}
            width="100%"
            flexDirection="row"
            // flexWrap="wrap"
            overflow="hidden"
          >
            {processedTags.length > 0 ? (
              processedTags.map((tag, index) => (
                <Box mb={1} mr={1} key={index} overflow="hidden">
                  <Tag text={tag} variant="outline" size="sm" />
                </Box>
              ))
            ) : (
              <Text color="gray500" variant="body3Italic">
                no tags
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
