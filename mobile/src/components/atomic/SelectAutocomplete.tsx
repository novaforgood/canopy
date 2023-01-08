import { ReactElement, useEffect, useRef, useState } from "react";

import {
  FlatList,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import OutsidePressHandler from "react-native-outside-press";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { BxCaretDown } from "../../generated/icons/regular";

import { Box } from "./Box";
import { Text } from "./Text";
import { TextInput } from "./TextInput";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          blurOnSubmit={false}
          onPressOut={() => setFocused((prev) => !prev)}
          ref={inputRef}
          width="100%"
          placeholder={placeholder}
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
              <FlatList
                data={filteredOptions}
                ListEmptyComponent={
                  <Box position="relative" py={2} px={2}>
                    <Text color="gray700" variant="body2Italic">
                      Nothing found.
                    </Text>
                  </Box>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item.value, item.label);
                      setQuery("");
                      setFocused(false);
                    }}
                  >
                    <Box flexDirection="row" alignItems="center" py={2} px={2}>
                      <Text>{item.label}</Text>
                    </Box>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="always"
                style={{ maxHeight: 200 }}
              />
            </Box>
          </Animated.View>
        )}
      </Box>
    </OutsidePressHandler>
  );
}
