import {
  cloneElement,
  forwardRef,
  ReactElement,
  ReactNode,
  useId,
} from "react";

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

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    const {
      label,
      renderPrefix,
      renderSuffix,
      characterLimit,
      onValueChange,
      onChange,
      ...rest
    } = props;

    const uuid = useId();

    const containerStyles = classNames({
      "border border-gray-400 bg-white focus-within:border-black rounded-md py-2 px-4 transition":
        true,
      "flex items-center": true,
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
        <div
          className={containerStyles}
          onClick={() => {
            if (typeof ref !== "function") {
              if (ref?.current) {
                ref.current.focus();
              }
            }
          }}
        >
          {prefix}
          <input
            {...rest}
            className={inputStyles}
            id={uuid}
            onChange={(e) => {
              const newVal = e.target.value.substring(0, characterLimit);
              e.target.value = newVal;
              onChange?.(e);
              onValueChange?.(newVal);
            }}
          />
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
);

TextInput.displayName = "TextInput";
