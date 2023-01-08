import { Box, BoxProps } from "../atomic/Box";
import { ProfileImage } from "../ProfileImage";

type ChatRoomImageProps = BoxProps & {
  profiles: {
    imageUrl: string | undefined;
  }[];
  onPress?: () => void;
};

export function ChatRoomImage(props: ChatRoomImageProps) {
  const { profiles, onPress, ...boxProps } = props;

  // Move towards end if no image
  const sortedProfiles = profiles.sort((a, b) => {
    if (a.imageUrl && !b.imageUrl) {
      return -1;
    }
    if (!a.imageUrl && b.imageUrl) {
      return 1;
    }
    return 0;
  });

  if (sortedProfiles.length === 0) {
    return null;
  }

  if (sortedProfiles.length === 1) {
    return (
      <ProfileImage
        {...boxProps}
        onPress={onPress}
        src={sortedProfiles[0].imageUrl}
      />
    );
  }

  return (
    <Box {...boxProps} position="relative">
      <Box position="absolute" top={0} right={0} height="66%" width="66%">
        <ProfileImage
          src={sortedProfiles[1].imageUrl}
          height="100%"
          width="100%"
        />
      </Box>
      <Box position="absolute" bottom={0} left={0} height="66%" width="66%">
        <ProfileImage
          src={sortedProfiles[0].imageUrl}
          height="100%"
          width="100%"
        />
      </Box>
    </Box>
  );
}
