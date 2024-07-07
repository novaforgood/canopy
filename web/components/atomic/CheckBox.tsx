import { ReactNode } from "react";

import { Text } from ".";

export function CheckBox(
  props: {
    label?: ReactNode;
  } & React.InputHTMLAttributes<HTMLInputElement>
) {
  const { label, ...rest } = props;

  return (
    <div className="flex items-baseline gap-3">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 shrink-0 translate-y-[2px]"
        {...rest}
      />
      <Text variant="body1">{label}</Text>
    </div>
  );
}
