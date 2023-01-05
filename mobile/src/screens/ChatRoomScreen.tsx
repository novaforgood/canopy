import { ScrollView, SafeAreaView, KeyboardAvoidingView } from "react-native";

import { Text } from "../components/atomic/Text";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useChatRoomQuery, useProfileByIdQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";

import { RenderChatRoom } from "./directory/RenderChatRoom";

import type { RootStackParamList } from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

export function ChatRoomScreen({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "ChatRoom">) {
  const chatRoomId = route.params.chatRoomId;

  const [{ data: chatRoomData, fetching }] = useChatRoomQuery({
    variables: { chat_room_id: chatRoomId },
  });

  const chatRoom = chatRoomData?.chat_room_by_pk;

  if (fetching) {
    return <LoadingSpinner />;
  }
  return (
    <SafeAreaView>
      {chatRoom && chatRoomId === chatRoom.id ? (
        <RenderChatRoom chatRoom={chatRoom} />
      ) : (
        <Text>Loading</Text>
      )}
    </SafeAreaView>
  );
}
