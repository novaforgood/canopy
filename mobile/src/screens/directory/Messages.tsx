import { Link, useNavigation } from "@react-navigation/native";
import { formatDistanceStrict } from "date-fns";
import { useState, useEffect, useCallback, useMemo } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import { Box } from "../../components/atomic/Box";
import { Text } from "../../components/atomic/Text";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ProfileImage } from "../../components/ProfileImage";
import { useAllChatRoomsSubscription } from "../../generated/graphql";
import { BxChevronRight } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { NavigationProp } from "../../navigation/types";

function useTimeFormatter() {
  const [timeNow, setTimeNow] = useState(new Date());

  // Update timenow every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatTimeSuperConcise = useCallback(
    (date: Date) => {
      const formatString = formatDistanceStrict(date, timeNow)
        .replace(" minutes", "m")
        .replace(" hours", "h")
        .replace(" days", "d")
        .replace(" weeks", "w");

      if (formatString.includes("second")) {
        return "<1m";
      } else {
        return formatString;
      }
    },
    [timeNow]
  );

  return useMemo(
    () => ({
      formatTimeSuperConcise,
    }),
    [formatTimeSuperConcise]
  );
}

export function Messages() {
  const navigation = useNavigation<NavigationProp>();

  const { formatTimeSuperConcise } = useTimeFormatter();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [{ data, fetching, error }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  // const chatRoomId = useQueryParam("chatRoomId", "string");

  const chatRooms = data?.chat_room ?? [];

  if (fetching) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <Text>Error: {JSON.stringify(error)}</Text>;
  }
  return (
    <SafeAreaView>
      <ScrollView style={{ height: "100%" }}>
        <Box>
          {chatRooms.map((room) => {
            const otherProfileEntry = room.profile_to_chat_rooms.find(
              (p) => p.profile.id !== currentProfile?.id
            );
            const myProfileEntry = room.profile_to_chat_rooms.find(
              (p) => p.profile.id === currentProfile?.id
            );

            if (!otherProfileEntry || !myProfileEntry) {
              return null;
            }

            const { first_name, last_name } = otherProfileEntry.profile.user;
            const image =
              otherProfileEntry.profile.profile_listing?.profile_listing_image
                ?.image;
            const latestMessage = room.chat_messages[0];

            const shouldNotHighlight =
              // Latest message was sent by me
              latestMessage.sender_profile_id === myProfileEntry.profile.id ||
              // Latest message sent by the other guy was read
              (myProfileEntry.latest_read_chat_message_id &&
                latestMessage.id <= myProfileEntry.latest_read_chat_message_id);

            return (
              <TouchableOpacity
                onPress={() => {
                  // nav
                  navigation.navigate("ChatRoom", {
                    chatRoomId: room.id,
                    chatRoomName: `${first_name} ${last_name}`,
                  });
                }}
                key={room.id}
                // href={`/space/${currentSpace?.slug}/chat/${room.id}`}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  borderRadius="md"
                  p={4}
                >
                  <ProfileImage src={image?.url} height={48} width={48} />

                  <Box ml={3} flexDirection="column">
                    <Text variant="subheading2" mb={1}>
                      {first_name} {last_name}
                    </Text>
                    <Box flexDirection="row" alignItems="center" width="100%">
                      <Text
                        color={shouldNotHighlight ? "gray800" : "black"}
                        variant={shouldNotHighlight ? "body2" : "body2Bold"}
                        numberOfLines={1}
                      >
                        {latestMessage?.sender_profile_id === currentProfile?.id
                          ? "You: "
                          : ""}
                        {latestMessage?.text}
                      </Text>
                      <Text
                        variant="body2"
                        color="gray500"
                        textAlign="right"
                        ml={3}
                      >
                        {formatTimeSuperConcise(
                          new Date(latestMessage?.created_at ?? "")
                        )}
                      </Text>
                    </Box>
                  </Box>
                  <Box flex={1} flexDirection="row" justifyContent="flex-end">
                    <BxChevronRight height={28} width={28} color="gray700" />
                  </Box>
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
