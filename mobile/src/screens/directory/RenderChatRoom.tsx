import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import { Link, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { Button, Keyboard, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "../../components/atomic/Box";
import { Text } from "../../components/atomic/Text";
import { TextInput } from "../../components/atomic/TextInput";
import { CustomKeyboardAvoidingView } from "../../components/CustomKeyboardAvoidingView";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ProfileImage } from "../../components/ProfileImage";
import {
  useMessagesQuery,
  useUpdateLatestReadMessageMutation,
  useMessagesStreamSubscription,
  useSendMessageMutation,
  ChatRoomQuery,
  MessagesQuery,
} from "../../generated/graphql";
import { BxChevronLeft, BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrevious } from "../../hooks/usePrevious";
import { DEFAULT_ID_CAP, MESSAGES_PER_FETCH } from "../../lib/constants";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { NavigationProp } from "../../navigation/types";

type ChatMessage = MessagesQuery["chat_message"][number];
type ChatRoom = ChatRoomQuery["chat_room_by_pk"];

const promiseQueue = new PromiseQueue();

const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const ONE_DAY = 1000 * 60 * 60 * 24;

function formatDateConcisely(date: Date): string {
  const timeAgo = Math.abs(date.getTime() - Date.now());
  if (timeAgo > ONE_WEEK) {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } else if (timeAgo > ONE_DAY) {
    return format(date, "EEEE 'at' h:mm a");
  } else {
    return format(date, "h:mm a");
  }
}

function shouldBreak(
  message1: ChatMessage | null,
  message2: ChatMessage | null
) {
  if (!message1 || !message2) {
    return true;
  }
  if (message1.sender_profile_id !== message2.sender_profile_id) {
    return true;
  }

  const date1 = new Date(message1.created_at);
  const date2 = new Date(message2.created_at);
  const diff = date2.getTime() - date1.getTime();

  return diff > FIVE_MINUTES;
}

export interface RenderChatRoomProps {
  chatRoom: NonNullable<ChatRoom>;
}

export function RenderChatRoom(props: RenderChatRoomProps) {
  const { chatRoom } = props;

  const navigation = useNavigation<NavigationProp>();

  const { currentSpace } = useCurrentSpace();
  const spaceSlug = currentSpace?.slug ?? "";

  const [currentTime] = useState(new Date());

  const { currentProfile } = useCurrentProfile();

  const otherProfileEntry = chatRoom.profile_to_chat_rooms.find(
    (p) => currentProfile && p.profile.id !== currentProfile.id
  );
  const myProfileEntry = chatRoom.profile_to_chat_rooms.find(
    (p) => currentProfile && p.profile.id === currentProfile.id
  );

  const otherProfile = otherProfileEntry?.profile;

  const [idCap, setIdCap] = useState(DEFAULT_ID_CAP);
  const [{ data: messagesData, fetching: fetchingMessages }] = useMessagesQuery(
    {
      variables: {
        chat_room_id: chatRoom.id,
        limit: MESSAGES_PER_FETCH,
        id_cap: idCap,
      },
    }
  );
  const messagesList = useMemo(
    () => messagesData?.chat_message ?? [],
    [messagesData?.chat_message]
  );

  // Mark message as read
  const [__, markAsRead] = useUpdateLatestReadMessageMutation();
  const markMessageAsRead = useCallback(
    async (message?: ChatMessage) => {
      if (!myProfileEntry || !message) {
        return;
      }

      if (!message) {
        return;
      }
      if (message.chat_room_id !== chatRoom.id) {
        return;
      }
      if (message.id <= myProfileEntry.latest_read_chat_message_id) {
        // No point in updating if not increasing
        return;
      }

      // console.log("SUCCESSFULLY AS READ");
      // console.log("   ", message.id, message.text);
      // console.log("   ", myProfileEntry.id);
      return markAsRead({
        id: myProfileEntry.id,
        latest_read_chat_message_id: message.id,
      });
    },
    [chatRoom.id, markAsRead, myProfileEntry]
  );

  useMessagesStreamSubscription<void>({
    variables: {
      chat_room_id: chatRoom.id,
      after: currentTime.toISOString(),
    },
  });

  const firstMessageId = chatRoom.first_chat_message[0].id;

  const minId = useMemo(() => {
    if (!messagesData) {
      return null;
    }
    const ids = messagesData?.chat_message.map((m) => m.id);
    return Math.min(...ids);
  }, [messagesData]);

  const noMoreMessages = minId === firstMessageId;

  const fetchMore = useCallback(() => {
    if (!minId) return;
    if (minId > 0) {
      setIdCap(minId);
    }
  }, [minId]);

  const loadMoreDisabled = idCap === minId;

  const [_, sendMessage] = useSendMessageMutation();
  const [message, setMessage] = useState("");

  const onMessageSubmit = useCallback(async () => {
    const processedMessage = message.trim();
    if (processedMessage.length === 0) {
      return;
    }

    if (!chatRoom.id) {
      return;
    }
    if (!currentProfile) {
      return;
    }

    setMessage("");

    const promise = sendMessage({
      input: {
        chat_room_id: chatRoom.id,
        sender_profile_id: currentProfile.id,
        text: processedMessage,
      },
    })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        }
      })
      .catch((error) => {
        console.error(`Error sending message: ${error.message}`);
      })
      .finally(() => {});

    promiseQueue.enqueue(promise);
  }, [message, chatRoom.id, currentProfile, sendMessage]);

  const { first_name, last_name } = otherProfile?.user ?? {};
  const image = otherProfile?.profile_listing?.profile_listing_image?.image;

  const lastMessageIdByOther: number = useMemo(() => {
    return (
      messagesList.find(
        (m) => currentProfile && m.sender_profile_id !== currentProfile.id
      )?.id ?? null
    );
  }, [messagesList, currentProfile]);

  const prevLastMessageIdByOther = usePrevious(lastMessageIdByOther);

  useEffect(() => {
    if (
      lastMessageIdByOther &&
      lastMessageIdByOther !== prevLastMessageIdByOther
    ) {
      const newMessage = messagesList.find(
        (m) => m.id === lastMessageIdByOther
      );
      markMessageAsRead(newMessage);
    }
  }, [
    lastMessageIdByOther,
    markMessageAsRead,
    messagesList,
    prevLastMessageIdByOther,
  ]);

  const scrollViewRef = useRef<ScrollView | null>(null);

  if (fetchingMessages) {
    return <LoadingSpinner />;
  }
  return (
    <CustomKeyboardAvoidingView>
      <Box
        flexDirection="column"
        overflow="hidden"
        borderRadius="md"
        height="100%"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="olive100"
          px={4}
          py={2}
          borderBottomColor="gray200"
          borderBottomWidth={1}
        >
          <TouchableOpacity
            onPress={() => {
              // Navigate to profile
              if (!otherProfile) return;

              navigation.navigate("ProfilePage", {
                profileId: otherProfile.id,
              });
            }}
          >
            <ProfileImage src={image?.url} height={40} width={40} mr={4} />
          </TouchableOpacity>

          <Box>
            <Text variant="subheading2">
              {first_name} {last_name}
            </Text>

            {otherProfile?.profile_listing?.headline && (
              <Text variant="body2" color="gray700">
                {otherProfile?.profile_listing?.headline}
              </Text>
            )}
          </Box>
        </Box>

        <ScrollView
          ref={scrollViewRef}
          style={{ transform: [{ scaleY: -1 }] }}
          // onContentSizeChange={() => {
          //   setTimeout(() => {
          //     scrollViewRef.current?.scrollToEnd({ animated: false });
          //   }, 50);
          // }}
        >
          <Box
            px={4}
            flexDirection="column-reverse"
            style={{ transform: [{ scaleY: -1 }] }}
          >
            {currentProfile &&
              messagesList.map((message, idx) => {
                // Note: Messages are ordered by created_at DESC
                const prevMessage = messagesList[idx + 1] ?? null;
                const nextMessage = messagesList[idx - 1] ?? null;

                const breakBefore = shouldBreak(prevMessage, message);
                const breakAfter = shouldBreak(message, nextMessage);

                const nextMessageIsFromDifferentSender =
                  nextMessage?.sender_profile_id !== message.sender_profile_id;

                let messageJsxElement = null;
                if (message.sender_profile_id === currentProfile.id) {
                  // Sent by me. Render chat bubble with my profile image on the right.
                  const isPending = typeof message.id === "string";

                  // Find next message sent by me
                  let nextMessageSentByMe = null;
                  for (let j = idx - 1; j >= 0; j--) {
                    const msg = messagesList[j];
                    if (msg.sender_profile_id === currentProfile.id) {
                      nextMessageSentByMe = msg;
                      break;
                    }
                  }
                  const isLastDelivered =
                    !isPending &&
                    (nextMessage === null ||
                      nextMessageSentByMe === null ||
                      typeof nextMessageSentByMe.id === "string");

                  messageJsxElement = (
                    <Box flexDirection="row" justifyContent="flex-end">
                      <Box flex={1}></Box>

                      <Box
                        mb={breakAfter ? 4 : 1}
                        flexDirection="column"
                        alignItems="flex-end"
                      >
                        <Box
                          ml={12}
                          borderTopLeftRadius="lg"
                          borderBottomLeftRadius="lg"
                          px={4}
                          py={1.5}
                          backgroundColor={isPending ? "lime300" : "lime400"}
                          borderTopRightRadius={breakBefore ? "lg" : undefined}
                          borderBottomRightRadius={
                            breakAfter ? "lg" : undefined
                          }
                        >
                          <Text variant="body1" selectable={true}>
                            {message.text}
                          </Text>
                        </Box>

                        {isLastDelivered && (
                          <Text variant="body3" color="gray700" mt={1}>
                            Delivered
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                } else {
                  // Sent by other. Render chat bubble with their profile image on the left.
                  const isLastMessage =
                    breakAfter || nextMessageIsFromDifferentSender;

                  messageJsxElement = (
                    <Box flexDirection="row" alignItems="flex-end">
                      <Box
                        flexDirection="row"
                        alignItems="flex-end"
                        mb={isLastMessage ? 4 : 1}
                      >
                        {isLastMessage ? (
                          <Box position="relative" width={36} flexShrink={0}>
                            <Box
                              position="absolute"
                              bottom={0}
                              height={36}
                              width={36}
                              flexShrink={0}
                            >
                              <ProfileImage
                                src={image?.url}
                                height={36}
                                width={36}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Box width={36} flexShrink={0}></Box>
                        )}
                        <Box flex={1} flexDirection="row">
                          <Box
                            ml={2}
                            mr={3}
                            borderTopRightRadius="lg"
                            borderBottomRightRadius="lg"
                            backgroundColor="gray200"
                            px={4}
                            py={1.5}
                            borderTopLeftRadius={breakBefore ? "lg" : undefined}
                            borderBottomLeftRadius={
                              breakAfter ? "lg" : undefined
                            }
                          >
                            <Text variant="body1" selectable={true}>
                              {message.text}
                            </Text>
                          </Box>
                          <Box flex={1}></Box>
                        </Box>
                      </Box>
                      <Box flex={1}></Box>
                    </Box>
                  );
                }

                return (
                  <Box key={message.id}>
                    {breakBefore && (
                      <Box
                        mt={4}
                        mb={2}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        width={"100%"}
                      >
                        <Text color="gray700" variant="body3">
                          {formatDateConcisely(new Date(message.created_at))}
                        </Text>
                      </Box>
                    )}
                    {messageJsxElement}
                  </Box>
                );
              })}
            {currentProfile && !noMoreMessages && (
              <Box
                my={4}
                flexDirection="row"
                justifyContent="center"
                width="100%"
              >
                <TouchableOpacity
                  onPress={() => {
                    fetchMore();
                  }}
                >
                  <Text color="gray700" variant="body3">
                    Load more...
                  </Text>
                </TouchableOpacity>
              </Box>
            )}
          </Box>
        </ScrollView>
        <Box
          height={1}
          width="100%"
          backgroundColor="gray600"
          flexShrink={0}
        ></Box>

        <Box
          flexDirection="row"
          alignItems="center"
          flexShrink={0}
          p={4}
          width="100%"
        >
          <Box flex={1} mr={2}>
            <TextInput
              placeholder={`Type a message to ${first_name}`}
              width="100%"
              value={message}
              onChangeText={setMessage}
              multiline={true}
              blurOnSubmit={false}
              // Submit on enter without shift being held down.
            />
          </Box>
          <TouchableOpacity
            onPress={(e) => {
              e.preventDefault();
              onMessageSubmit();
            }}
          >
            <BxSend height={32} width={32} color="black" />
          </TouchableOpacity>
        </Box>
      </Box>
    </CustomKeyboardAvoidingView>
  );
}
