import { cloneElement, ReactElement, ReactNode } from "react";

import { useElementSize } from "@mantine/hooks";
import classNames from "classnames";

import { Input, InputProps } from "../atomic/Input";

type TextInputProps = InputProps & {
  label?: string;
  renderPrefix?: () => JSX.Element;
};

export function TextInput(props: TextInputProps) {
  const { label, renderPrefix, ...rest } = props;

  const { ref, width, height } = useElementSize();

  console.log(width, height);

  return (
    <div className="flex flex-col w-full">
      {label && <label className="block text-sm font-bold mb-1">{label}</label>}
      <div className="relative">
        {renderPrefix && (
          <div className="absolute inset-y-0 left-0 pl-3 text-gray-700 flex items-center pointer-events-none">
            {cloneElement(renderPrefix(), { ref: ref })}
          </div>
        )}

        <Input
          {...rest}
          style={{ paddingLeft: renderPrefix ? width + 16 : undefined }}
        />
      </div>
    </div>
  );
}
