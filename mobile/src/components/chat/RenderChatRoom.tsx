import { useState, useMemo, useEffect, useRef } from "react";

import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { ScrollView, TouchableOpacity } from "react-native";

import { MessagesQuery, User_Type_Enum } from "../../generated/graphql";
import { BxInfoCircle, BxSend } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { usePrevious } from "../../hooks/usePrevious";
import { PromiseQueue } from "../../lib/PromiseQueue";
import { NavigationProp } from "../../navigation/types";
import { Box } from "../atomic/Box";
import { Modal } from "../atomic/Modal";
import { Text } from "../atomic/Text";
import { TextInput } from "../atomic/TextInput";
import { CustomKeyboardAvoidingView } from "../CustomKeyboardAvoidingView";
import { LoadingSpinner } from "../LoadingSpinner";
import { ProfileImage } from "../ProfileImage";

import { ChatParticipantsModalButton } from "./ChatParticipantsModalButton";
import { ChatProfileImage } from "./ChatProfileImage";
import { ChatRoomImage } from "./ChatRoomImage";
import { ChatTitle } from "./ChatTitle";
import { useChatRoom } from "./useChatRoom";
import { useMessages } from "./useMessages";
import {
  getChatParticipants,
  getChatRoomSubtitle,
  makeListSentence,
} from "./utils";

type ChatMessage = MessagesQuery["chat_message"][number];

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

function shouldTimeBreak(
  message1: ChatMessage | null,
  message2: ChatMessage | null
) {
  if (!message1 || !message2) {
    return true;
  }

  const date1 = new Date(message1.created_at);
  const date2 = new Date(message2.created_at);
  const diff = date2.getTime() - date1.getTime();

  return diff > FIVE_MINUTES;
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
  return shouldTimeBreak(message1, message2);
}

export interface RenderChatRoomProps {
  chatRoomId: string;
}

export function RenderChatRoom(props: RenderChatRoomProps) {
  const { chatRoomId } = props;

  const navigation = useNavigation<NavigationProp>();

  const { currentSpace } = useCurrentSpace();
  const spaceSlug = currentSpace?.slug ?? "";

  const [newMessage, setNewMessage] = useState("");
  const { chatRoom, chatParticipants } = useChatRoom(chatRoomId ?? "");

  const isIntro = !!chatRoom?.chat_intro_id;

  const { currentProfile } = useCurrentProfile();
  const {
    messagesList,
    onMessageSubmit,
    fetchMore,
    fetchingMessages,
    markMessageAsRead,
    noMoreMessages,
  } = useMessages(chatRoomId ?? "");

  const lastMessageIdByOther: number | null = useMemo(() => {
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

  if (fetchingMessages || !chatRoom) {
    return <LoadingSpinner />;
  }

  const chatSubtitle = getChatRoomSubtitle(chatRoom, currentProfile?.id ?? "");
  const allHumans = getChatParticipants(
    chatRoom?.profile_to_chat_rooms ?? []
  ).filter((p) => p.userType === User_Type_Enum.User);
  const otherHumans = allHumans.filter(
    (p) => p.profileId !== currentProfile?.id
  );

  const otherHumanNames =
    otherHumans.length <= 2 && otherHumans.length > 0
      ? makeListSentence(otherHumans.map((p) => p.firstName))
      : "the others";

  return (
    <CustomKeyboardAvoidingView>
      <Box
        flexDirection="column"
        overflow="hidden"
        borderRadius="md"
        height="100%"
        width="100%"
      >
        <Box
          width="100%"
          flexDirection="row"
          alignItems="center"
          backgroundColor="olive100"
          px={4}
          py={2}
          borderBottomColor="gray200"
          borderBottomWidth={1}
        >
          <ChatRoomImage
            profiles={otherHumans.map((p) => ({
              imageUrl: p.profileImage?.url,
              profileUrl: `/space/${spaceSlug}/profile/${p.profileId}`,
            }))}
            onPress={
              otherHumans.length === 1
                ? () => {
                    navigation.navigate("ProfilePage", {
                      profileId: otherHumans[0].profileId,
                    });
                  }
                : undefined
            }
            height={40}
            width={40}
            mr={4}
          />

          <Box flex={1}>
            <ChatTitle chatRoom={chatRoom} />

            {chatSubtitle && (
              <Text variant="body2" color="gray700">
                {chatSubtitle}
              </Text>
            )}
          </Box>

          <ChatParticipantsModalButton chatParticipants={allHumans} />
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
            {isIntro && (
              <Box
                mb={2}
                width="100%"
                alignItems="center"
                flexDirection="column"
              >
                <Text color="gray400" variant="body3">
                  Introduce yourself to {otherHumanNames}!
                </Text>
                <Text color="gray400" variant="body3">
                  Remember: Everyone on Canopy is here to meet people.
                </Text>
              </Box>
            )}
            {currentProfile &&
              messagesList.map((message, idx) => {
                // Note: Messages are ordered by created_at DESC
                const prevMessage = messagesList[idx + 1] ?? null;
                const nextMessage = messagesList[idx - 1] ?? null;

                const timeBreakBefore = shouldTimeBreak(prevMessage, message);
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
                          py={2}
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

                  const senderProfile =
                    chatParticipants.find(
                      (p) => p.profileId === message.sender_profile_id
                    ) ?? null;

                  if (!senderProfile) {
                    if (message.is_system_message) {
                      return (
                        <Text
                          variant="body2"
                          color="gray700"
                          textAlign="center"
                          mb={4}
                        >
                          {message.text}
                        </Text>
                      );
                    }
                  }

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
                              <ChatProfileImage
                                userType={senderProfile?.userType ?? null}
                                src={senderProfile?.profileImage?.url}
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
                            py={2}
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
                    {timeBreakBefore && (
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
              placeholder={`Type a message to send...`}
              width="100%"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline={true}
              blurOnSubmit={false}
              // Submit on enter without shift being held down.
            />
          </Box>
          <TouchableOpacity
            onPress={(e) => {
              e.preventDefault();
              onMessageSubmit(newMessage);
              setNewMessage("");
            }}
          >
            <BxSend height={32} width={32} color="black" />
          </TouchableOpacity>
        </Box>
      </Box>
    </CustomKeyboardAvoidingView>
  );
}
