import { useState, useEffect, useCallback, useMemo } from "react";

import { Link, useNavigation } from "@react-navigation/native";
import { formatDistanceStrict } from "date-fns";
import { SafeAreaView, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

import { Box } from "../../components/atomic/Box";
import { Button } from "../../components/atomic/Button";
import { Modal } from "../../components/atomic/Modal";
import { Text } from "../../components/atomic/Text";
import { ChatRoomImage } from "../../components/chat/ChatRoomImage";
import { ChatTitle } from "../../components/chat/ChatTitle";
import { getChatParticipants } from "../../components/chat/utils";
import { toast } from "../../components/CustomToast";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ProfileImage } from "../../components/ProfileImage";
import {
  useAllChatRoomsSubscription,
  User_Type_Enum,
} from "../../generated/graphql";
import { BxChevronRight } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { SecureStore, SecureStoreKey } from "../../lib/secureStore";
import { NavigationProp } from "../../navigation/types";

const AnimatedBox = Animated.createAnimatedComponent(Box);

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

export function MessagesScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { formatTimeSuperConcise } = useTimeFormatter();

  const { currentProfile } = useCurrentProfile();

  const {
    attemptRegisterPushNotifications,
    declineRegisterPushNotifications,
    shouldShowPushNotificationPermissionPrompt,
  } = usePushNotifications();

  const [{ data, fetching, error }, refetchChatRooms] =
    useAllChatRoomsSubscription({
      variables: { profile_id: currentProfile?.id ?? "" },
    });

  // const chatRoomId = useQueryParam("chatRoomId", "string");

  const chatRooms = data?.chat_room ?? [];

  return (
    <SafeAreaView style={{ position: "relative" }}>
      <ScrollView style={{ height: "100%" }}>
        <Button
          onPress={() => {
            SecureStore.delete(
              SecureStoreKey.ShowedPushNotificationPermissionPrompt
            );
          }}
        >
          Clear that thing
        </Button>
        <Box minHeight="100%" mt={2}>
          {fetching ? (
            <LoadingSpinner />
          ) : error ? (
            <Box p={4}>
              <Text variant="body1" textAlign="center" mt={4}>
                Could not load messages.
              </Text>
              <Button
                variant="outline"
                size="sm"
                mt={4}
                onPress={() => {
                  refetchChatRooms();
                }}
              >
                Retry
              </Button>
            </Box>
          ) : chatRooms.length === 0 ? (
            <Box
              p={4}
              height="100%"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="body1" textAlign="center" mt={4}>
                You have no chats yet. View profiles to start chatting with
                someone.
              </Text>
              <Button
                variant="outline"
                mt={4}
                onPress={() => {
                  navigation.navigate("ProfilesList");
                }}
              >
                View profiles
              </Button>
            </Box>
          ) : (
            chatRooms.map((room) => {
              const otherProfileEntry = room.profile_to_chat_rooms.find(
                (p) => p.profile.id !== currentProfile?.id
              );
              const myProfileEntry = room.profile_to_chat_rooms.find(
                (p) => p.profile.id === currentProfile?.id
              );

              if (!otherProfileEntry || !myProfileEntry) {
                return null;
              }

              const latestMessage = room.latest_chat_message[0];

              const shouldNotHighlight =
                // Latest message was sent by me
                latestMessage.sender_profile_id === myProfileEntry.profile.id ||
                // Latest message sent by the other guy was read
                (myProfileEntry.latest_read_chat_message_id &&
                  latestMessage.id <=
                    myProfileEntry.latest_read_chat_message_id);

              const otherHumans = getChatParticipants(
                room.profile_to_chat_rooms
              )
                .filter((h) => h.userType === User_Type_Enum.User)
                .filter((h) => h.profileId !== currentProfile?.id);

              return (
                <TouchableOpacity
                  onPress={() => {
                    // nav
                    navigation.navigate("ChatRoom", {
                      chatRoomId: room.id,
                    });
                  }}
                  key={room.id}
                  // href={`/space/${currentSpace?.slug}/chat/${room.id}`}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    borderRadius="md"
                    px={4}
                    py={2}
                  >
                    <ChatRoomImage
                      height={60}
                      width={60}
                      profiles={otherHumans.map((p) => ({
                        imageUrl: p.profileImage?.url,
                      }))}
                    />

                    <Box ml={3} flexDirection="column" flex={1}>
                      <ChatTitle
                        chatRoom={room}
                        highlight={!shouldNotHighlight}
                      />

                      <Box
                        mt={1}
                        flexDirection="row"
                        alignItems="center"
                        width="100%"
                      >
                        <Text
                          color={shouldNotHighlight ? "gray800" : "black"}
                          variant={shouldNotHighlight ? "body2" : "body2Medium"}
                          numberOfLines={1}
                        >
                          {latestMessage?.sender_profile_id ===
                          currentProfile?.id
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
                    <Box flexDirection="row" justifyContent="flex-end">
                      <BxChevronRight height={28} width={28} color="gray700" />
                    </Box>
                  </Box>
                </TouchableOpacity>
              );
            })
          )}
        </Box>
      </ScrollView>
      <Modal
        isVisible={shouldShowPushNotificationPermissionPrompt}
        onCloseButtonPress={() => {
          declineRegisterPushNotifications();
        }}
      >
        <Box
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          py={8}
        >
          <Text variant="body1" textAlign="center">
            Allow push notifications to be notified of incoming messages!
          </Text>
          <Button
            variant="cta"
            mt={8}
            onPress={() => {
              toast.success(
                "Push notifications enabled! or at least trying to"
              );
              attemptRegisterPushNotifications();
            }}
          >
            Allow
          </Button>
          <Button
            variant="secondary"
            mt={2}
            onPress={() => {
              declineRegisterPushNotifications(true);
            }}
          >
            Don't show again
          </Button>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
