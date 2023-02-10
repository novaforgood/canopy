import { useDisclosure } from "@mantine/hooks";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { BxInfoCircle } from "../../generated/icons/regular";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { NavigationProp } from "../../navigation/types";
import { Box } from "../atomic/Box";
import { Modal } from "../atomic/Modal";
import { Text } from "../atomic/Text";
import { ProfileImage } from "../ProfileImage";

import { ChatParticipant } from "./utils";

interface ChatParticipantsModalButtonProps {
  chatParticipants: ChatParticipant[];
}
export function ChatParticipantsModalButton(
  props: ChatParticipantsModalButtonProps
) {
  const { chatParticipants } = props;

  const navigation = useNavigation<NavigationProp>();

  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const [open, handlers] = useDisclosure(false);

  return (
    <>
      <TouchableOpacity
        onPress={handlers.open}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <BxInfoCircle height={24} width={24} color="gray500" />
      </TouchableOpacity>

      <Modal isVisible={open} onCloseButtonPress={handlers.close}>
        <Box
          flexDirection="column"
          alignItems="center"
          borderRadius="md"
          backgroundColor="white"
          padding={8}
          width="100%"
        >
          <Text variant="subheading1">People in this chat</Text>
          <Box mt={8} flexDirection="column" width="100%">
            {chatParticipants.map((p) => (
              <Box
                mt={4}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                key={p.profileId}
              >
                <Box flexDirection="row" alignItems="center">
                  <ProfileImage
                    height={36}
                    width={36}
                    src={p.profileImage?.url}
                  />
                  <Text variant="body1" ml={2}>
                    {p.fullName}
                  </Text>
                </Box>
                {p.profileId === currentProfile?.id ? (
                  <Text variant="body1" color="gray500">
                    You
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      handlers.close();
                      // Wait 200ms
                      setTimeout(() => {
                        navigation.navigate("ProfilePage", {
                          profileId: p.profileId,
                        });
                      }, 300);
                    }}
                  >
                    <Text color="gray500" variant="body1">
                      View Profile
                    </Text>
                  </TouchableOpacity>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>
    </>
  );
}
