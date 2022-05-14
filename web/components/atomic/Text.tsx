import classNames from "classnames";
import React, { HTMLAttributes } from "react";

type TextProps = HTMLAttributes<HTMLDivElement> & {
  variant?:
    | "heading1"
    | "heading2"
    | "heading3"
    | "heading4"
    | "subheading1"
    | "subheading2"
    | "subheading3"
    | "body1"
    | "body2"
    | "body3";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  className?: string;
};

export const Text = ({
  variant = "body1",
  bold = false,
  italic = false,
  underline = false,
  className,
  ...props
}: TextProps) => {
  let styles = classNames(
    "font-sans",
    { "text-heading1 leading-tight": variant === "heading1" },
    { "text-heading2 leading-tight": variant === "heading2" },
    { "text-heading3 leading-tight": variant === "heading3" },
    { "text-heading4 leading-tight": variant === "heading4" },
    { "text-body1": variant === "body1" },
    { "text-body2": variant === "body2" },
    { "text-body3": variant === "body3" },
    { "font-bold": bold },
    { italic: italic }, // Styling needs to be polished
    { underline: underline },
    { [`${className}`]: true }
  );

  return <span {...props} className={styles}></span>;
};
