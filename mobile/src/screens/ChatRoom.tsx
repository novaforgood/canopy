import type { StackScreenProps } from "@react-navigation/stack";
import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Text } from "../components/atomic/Text";
import {
  useChatRoomSubscription,
  useProfileByIdQuery,
} from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import type { RootStackParamList } from "../navigation/types";
import { ScrollView, SafeAreaView, KeyboardAvoidingView } from "react-native";
import { BxEdit, BxMessageDetail } from "../generated/icons/regular";
import { ProfileImage } from "../components/ProfileImage";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { HtmlDisplay } from "../components/HtmlDisplay";
import { Tag } from "../components/Tag";
import { ProfileSocialsDisplay } from "../components/profile-socials/ProfileSocialsDisplay";
import { RenderChatRoom } from "./directory/RenderChatRoom";

export function ChatRoomScreen({
  navigation,
  route,
}: StackScreenProps<RootStackParamList, "ChatRoom">) {
  const chatRoomId = route.params.chatRoomId;

  const [{ data: chatRoomData }] = useChatRoomSubscription({
    variables: { chat_room_id: chatRoomId },
  });

  const chatRoom = chatRoomData?.chat_room_by_pk;

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
