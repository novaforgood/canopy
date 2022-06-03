import { cloneElement, ReactElement, ReactNode, useId } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

import { Input, InputProps } from "../atomic/Input";
import { Text } from "../atomic/Text";

type TextInputProps = InputProps & {
  label?: string;
  renderPrefix?: () => JSX.Element;
  characterLimit?: number;
};

export function TextInput(props: TextInputProps) {
  const {
    label,
    renderPrefix,
    characterLimit,
    onValueChange,
    onChange,
    ...rest
  } = props;

  const { ref, width, height } = useElementSize();
  const uuid = useId();

  const overCharacterLimit = (value: string) =>
    characterLimit && value.length > characterLimit;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={uuid} className="block text-sm font-bold mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {renderPrefix && (
          <div className="absolute inset-y-0 left-0 pl-3 text-gray-700 flex items-center pointer-events-none">
            {cloneElement(renderPrefix(), { ref: ref })}
          </div>
        )}

        <Input
          {...rest}
          className="w-full"
          id={uuid}
          onValueChange={(newVal) => {
            onValueChange?.(newVal.substring(0, characterLimit));
          }}
          onChange={(e) => {
            e.target.value = e.target.value.substring(0, characterLimit);
            onChange?.(e);
          }}
          style={{ paddingLeft: renderPrefix ? width + 16 : undefined }}
        />
      </div>
      {characterLimit && (
        <Text italic className="text-gray-600 self-end mt-1">
          {`${rest.value?.toString().length}/${characterLimit} characters`}
        </Text>
      )}
    </div>
  );
}
