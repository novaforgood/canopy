import { cloneElement, ReactElement, ReactNode, useId } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

import { Text } from "../atomic/Text";
import { Textarea, TextAreaProps } from "../atomic/Textarea";

type SimpleTextAreaProps = TextAreaProps & {
  label?: string;
  renderPrefix?: () => JSX.Element;
  characterLimit?: number;
};

export function SimpleTextArea(props: SimpleTextAreaProps) {
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
    <div className="flex w-full flex-col">
      {label && (
        <label htmlFor={uuid} className="mb-1 block text-sm font-bold">
          {label}
        </label>
      )}
      <div className="relative">
        {renderPrefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">
            {cloneElement(renderPrefix(), { ref: ref })}
          </div>
        )}

        <Textarea
          {...rest}
          className="w-full"
          id={uuid}
          onValueChange={(newVal) => {
            onValueChange?.(newVal.substring(0, characterLimit));
          }}
          onChange={(e) => {
            (e.target as HTMLTextAreaElement).value = (
              e.target as HTMLTextAreaElement
            ).value.substring(0, characterLimit);
            onChange?.(e);
          }}
          style={{ paddingLeft: renderPrefix ? width + 16 : undefined }}
        />
      </div>
      {characterLimit && (
        <Text italic className="mt-1 self-end text-gray-600">
          {`${rest.value?.toString().length}/${characterLimit} characters`}
        </Text>
      )}
    </div>
  );
}
