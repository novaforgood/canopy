import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView, Platform } from "react-native";

export function CustomKeyboardAvoidingView(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  const headerHeight = useHeaderHeight();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
