import classNames from "classnames";
import React, { HTMLProps } from "react";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

type TextAreaProps = TextareaAutosizeProps &
  Omit<HTMLProps<HTMLTextAreaElement>, "style" | "ref">;

//TODO: Implement color depending on theme
export const Textarea = ({ className = "", ...props }: TextAreaProps) => {
  const styles = classNames({
    "border border-gray-400 focus:border-black rounded-md px-4 py-2 focus:outline-none transition":
      true,
    [`${className}`]: true,
  });
  return <TextareaAutosize minRows={2} {...props} className={styles} />;
};
