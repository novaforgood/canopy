import { cloneElement, ReactElement, ReactNode, useId } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

import { Input, InputProps } from "../atomic/Input";
import { Text } from "../atomic/Text";

type TextInputProps = InputProps & {
  label?: string;
  renderPrefix?: () => JSX.Element;
  renderSuffix?: () => JSX.Element;
  characterLimit?: number;
};

export function TextInput(props: TextInputProps) {
  const {
    label,
    renderPrefix,
    renderSuffix,
    characterLimit,
    onValueChange,
    onChange,
    ...rest
  } = props;

  const { ref, width, height } = useElementSize();
  const uuid = useId();

  const containerStyles = classNames({
    "border border-gray-400 bg-white focus:border-black rounded-md py-2 px-4 transition":
      true,
    "flex items-center": true,
    // "pl-4": !renderPrefix,
    // "pr-4": !renderSuffix,
  });

  const inputStyles = classNames({
    "w-full outline-none": true,
  });

  const overCharacterLimit = (value: string) =>
    characterLimit && value.length > characterLimit;

  const prefix = renderPrefix?.();
  const suffix = renderSuffix?.();

  return (
    <div className="flex w-full flex-col">
      {label && (
        <label htmlFor={uuid} className="mb-1 block text-sm font-bold">
          {label}
        </label>
      )}
      {/* <div className="relative">
        {renderPrefix && (
          <div className="absolute inset-y-0 left-0 pl-3 text-gray-700 flex items-center pointer-events-none">
            {cloneElement(renderPrefix(), { ref: ref })}
          </div>
        )} */}
      <div className={containerStyles}>
        {prefix}

        <input
          {...rest}
          ref={ref}
          className={inputStyles}
          id={uuid}
          onChange={(e) => {
            const newVal = e.target.value.substring(0, characterLimit);
            e.target.value = newVal;
            onChange?.(e);
            onValueChange?.(newVal);
          }}
        />

        {/* <Input
          {...rest}
          className="w-full"
          style={{ paddingLeft: renderPrefix ? width + 16 : undefined }}
        /> */}
        {suffix}
      </div>
      {characterLimit && (
        <Text italic className="mt-1 self-end text-gray-600">
          {`${rest.value?.toString().length}/${characterLimit} characters`}
        </Text>
      )}
    </div>
  );
}
