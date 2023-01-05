import { useEffect, useState } from "react";

import { useNavigation } from "@react-navigation/native";

import { Box } from "../components/atomic/Box";
import { Button } from "../components/atomic/Button";
import { Modal } from "../components/atomic/Modal";
import { Text } from "../components/atomic/Text";
import { TextInput } from "../components/atomic/TextInput";
import { toast } from "../components/CustomToast";
import { useProfileByIdQuery } from "../generated/graphql";
import { BxSend } from "../generated/icons/regular";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { apiClient } from "../lib/apiClient";
import { NavigationProp } from "../navigation/types";

export const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
  profileId: string | null;
}

export function MessageModal(props: MessageModalProps) {
  const { isOpen, onClose, profileId, onMessageSent } = props;

  const navigation = useNavigation<NavigationProp>();

  const { currentSpace } = useCurrentSpace();
  const isLoggedIn = useIsLoggedIn();
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const [introMsg, setIntroMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIntroMsg("");
    }
  }, [isOpen]);

  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const [createdChatRoomId, setCreatedChatRoomId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!currentProfile) {
      toast.error("Please login to send a message");
      return;
    }

    if (!profileId) {
      toast.error("Please select a profile to send a message");
      return;
    }

    await apiClient
      .post<
        {
          senderProfileId: string;
          receiverProfileId: string;
          firstMessage: string;
        },
        { chatRoomId: string }
      >("/api/chat/createChatRoom", {
        senderProfileId: currentProfile.id,
        receiverProfileId: profileId,
        firstMessage: introMsg,
      })
      .then((data) => {
        console.log(data);
        onMessageSent();
        setCreatedChatRoomId(data.chatRoomId);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const navigateToChatRoom = async () => {
    if (createdChatRoomId) {
      // Nav to chat room
      navigation.navigate("ChatRoom", {
        chatRoomId: createdChatRoomId,
      });
      onClose();
    } else {
      toast.error("No chat room id");
    }
  };

  if (!profileData?.profile_by_pk) {
    return null;
  }

  return (
    <>
      <Modal
        isVisible={isOpen}
        onCloseButtonPress={onClose}
        // onAction={createdChatRoomId ? navigateToChatRoom : sendMessage}
        // actionDisabled={createdChatRoomId ? false : !introMsg}
        // secondaryActionText={createdChatRoomId ? "Close" : "Cancel"}
        // onSecondaryAction={onClose}
      >
        <Box px={16} pt={8}>
          <Box flexDirection="column" alignItems="center" width={300}>
            <Text variant="heading4">
              {createdChatRoomId
                ? "Message sent!"
                : `Message ${profileData.profile_by_pk.user.first_name}`}
            </Text>

            <Box mt={8}></Box>

            <Box flexDirection="column" width={300}>
              {createdChatRoomId ? (
                <Text>
                  {profileData.profile_by_pk.user.first_name} will receive a
                  notification of your message request.
                </Text>
              ) : (
                <Box flexDirection="column" width="100%">
                  <Text mb={2} color="gray600">
                    Message
                  </Text>
                  <TextInput
                    multiline={true}
                    keyboardType="default"
                    numberOfLines={4}
                    value={introMsg}
                    onChangeText={setIntroMsg}
                    placeholder="Example: Hi, I’m Billy! I can’t believe that someone else here is interested in dinosaurs. Maybe we could chat about it sometime? :)"
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Button
            mt={12}
            loading={loading}
            disabled={createdChatRoomId ? false : !introMsg}
            onPress={() => {
              const action = createdChatRoomId
                ? navigateToChatRoom
                : sendMessage;

              setLoading(true);
              action().finally(() => {
                setLoading(false);
              });
            }}
          >
            {createdChatRoomId ? (
              "View chat"
            ) : (
              <Box flexDirection="row">
                <Text color="white" variant="body1">
                  Send message
                </Text>
                <Box ml={1.5} mr={-1.5} height={18} width={18}>
                  <BxSend height="100%" width="100%" color="white" />
                </Box>
              </Box>
            )}
          </Button>
          <Button variant="secondary" mb={4} onPress={onClose}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}
