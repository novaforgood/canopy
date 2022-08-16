import React, { HTMLProps, useLayoutEffect, useState } from "react";

import classNames from "classnames";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

export type TextAreaProps = TextareaAutosizeProps &
  Omit<HTMLProps<HTMLTextAreaElement>, "style" | "ref"> & {
    onValueChange?: (value: string) => void;
  };

//TODO: Implement color depending on theme
export const Textarea = ({
  className = "",
  onValueChange = () => {},
  onChange,
  ...props
}: TextAreaProps) => {
  // Hack to make minrows work
  // https://github.com/Andarist/react-textarea-autosize/issues/337#issuecomment-1024980737
  const [, setIsRerendered] = useState(false);
  useLayoutEffect(() => setIsRerendered(true), []);

  const styles = classNames({
    "border border-gray-400 focus:border-black rounded-md px-4 py-2 focus:outline-none transition resize-none":
      true,
    [`${className}`]: true,
  });
  return (
    <TextareaAutosize
      minRows={2}
      {...props}
      className={styles}
      onChange={(event) => {
        onValueChange(event.target.value);
        if (onChange) {
          onChange(event);
        }
      }}
    />
  );
};
