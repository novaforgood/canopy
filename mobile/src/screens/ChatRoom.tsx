import type { StackScreenProps } from "@react-navigation/stack";

import { Text } from "../components/atomic/Text";
import { useChatRoomQuery, useProfileByIdQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import type { RootStackParamList } from "../navigation/types";
import { ScrollView, SafeAreaView, KeyboardAvoidingView } from "react-native";

import { RenderChatRoom } from "./directory/RenderChatRoom";
import { LoadingSpinner } from "../components/LoadingSpinner";

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
