import {
  Fragment,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GestureResponderEvent,
  TextInput as RNTextInput,
  TouchableOpacity,
} from "react-native";
import {
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import OutsidePressHandler from "react-native-outside-press";

import { BxCaretDown } from "../../generated/icons/regular";

import { Box } from "./Box";
import { Text } from "./Text";
import { TextInput, TextInputProps } from "./TextInput";

type OptionType<T> = { label: string; value: T };

const EXTRA_OPTION_VALUE = "extra-option-value-asdfghjkll";
interface SelectAutocompleteProps<T> {
  options: OptionType<T>[];
  value: T | null;
  onSelect?: (selectedValue: T | null, selectedLabel?: string) => void;
  className?: string;
  placeholder?: string;
  renderExtraOption?: (
    inputValue: string,
    props?: { active: boolean; selected: boolean }
  ) => ReactElement;
  onExtraOptionSelect?: (inputValue: string) => void;
}

export function SelectAutocomplete<T extends string>(
  props: SelectAutocompleteProps<T>
) {
  const {
    options,
    value,
    onSelect = () => {},
    className,
    placeholder,
    renderExtraOption,
    onExtraOptionSelect = () => {},
  } = props;
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const item = options.find((i) => i.value === value) ?? null;

  const [focused, setFocused] = useState(false);

  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focused]);

  return (
    <OutsidePressHandler
      disabled={false}
      onOutsidePress={() => {
        setFocused(false);
      }}
    >
      <Box
        position="relative"
        flexDirection="row"
        alignItems="center"
        width="100%"
        zIndex={1}
      >
        <TextInput
          ref={inputRef}
          width="100%"
          placeholder={placeholder}
          onPressOut={() => {
            setFocused((prev) => !prev);
          }}
          value={query}
          onChangeText={setQuery}
        ></TextInput>
        <Box position="absolute" right={0} mr={2} pointerEvents="none">
          <BxCaretDown height={24} width={24} color="black" />
        </Box>
        {focused && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(100)}
            style={{
              position: "absolute",
              top: "100%",
              width: "100%",
              zIndex: 2,
            }}
          >
            <Box
              backgroundColor="white"
              width="100%"
              p={2}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={1}
              elevation={5}
              borderRadius="sm"
            >
              <ScrollView
                style={{ maxHeight: 200 }}
                keyboardShouldPersistTaps="handled"
              >
                {filteredOptions.map((option, idx) => (
                  <TouchableWithoutFeedback
                    key={idx}
                    onPress={() => {
                      onSelect(option.value, option.label);
                      setQuery("");
                      setFocused(false);
                      console.log("What the fuck");
                    }}
                  >
                    <Box
                      key={option.value}
                      flexDirection="row"
                      alignItems="center"
                      py={2}
                      px={2}
                    >
                      <Text>{option.label}</Text>
                    </Box>
                  </TouchableWithoutFeedback>
                ))}
                {filteredOptions.length === 0 && (
                  <Box position="relative" py={2} px={4}>
                    <Text color="gray700" variant="body2Italic">
                      Nothing found.
                    </Text>
                  </Box>
                )}
              </ScrollView>
            </Box>
          </Animated.View>
        )}
      </Box>
    </OutsidePressHandler>
  );
}
