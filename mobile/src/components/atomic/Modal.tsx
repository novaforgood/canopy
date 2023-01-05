import React from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";
import RNModal from "react-native-modal";

import { BxSad, BxX } from "../../generated/icons/regular";

import type { ModalProps } from "react-native-modal";

interface ComponentProps {
  onCloseButtonPress?: () => void;
}

export function Modal(props: ComponentProps & Partial<ModalProps>) {
  const {
    children,
    isVisible,
    animationIn = "fadeIn",
    animationOut = "fadeOut",
    backdropTransitionOutTiming = 0,
    backdropTransitionInTiming = 0,
    onCloseButtonPress = () => {},
    ...rest
  } = props;
  return (
    <RNModal
      animationIn={animationIn}
      animationOut={animationOut}
      backdropTransitionOutTiming={backdropTransitionOutTiming}
      backdropTransitionInTiming={backdropTransitionInTiming}
      isVisible={isVisible}
      onBackdropPress={onCloseButtonPress}
      {...rest}
    >
      <View style={styles.modalView}>
        <TouchableOpacity
          style={styles.closeButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={onCloseButtonPress}
        >
          <BxX height={24} width={24} color="white" />
        </TouchableOpacity>
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    paddingBottom: 5,
    bottom: "100%",
    right: 0,
  },
});
