import { ScrollView, SafeAreaView, KeyboardAvoidingView } from "react-native";

import { Text } from "../components/atomic/Text";
import { RenderChatRoom } from "../components/chat/RenderChatRoom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useChatRoomQuery, useProfileByIdQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";

import type {
  RootStackParamList,
  SpaceStackParamList,
} from "../navigation/types";
import type { StackScreenProps } from "@react-navigation/stack";

export function ChatRoomScreen({
  navigation,
  route,
}: StackScreenProps<SpaceStackParamList, "ChatRoom">) {
  const chatRoomId = route.params.chatRoomId;

  return (
    <SafeAreaView>
      <RenderChatRoom chatRoomId={route.params.chatRoomId} />
    </SafeAreaView>
  );
}
