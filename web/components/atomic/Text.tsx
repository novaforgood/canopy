import React, { HTMLAttributes } from "react";

import classNames from "classnames";

type TextVariant =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "subheading1"
  | "subheading2"
  | "body1"
  | "body2"
  | "body3";
type TextProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TextVariant;
  mobileVariant?: TextVariant;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  medium?: boolean;
  className?: string;
};

function appendSm(str: string) {
  return str
    .split(" ")
    .map((s) => `sm:${s}`)
    .join(" ");
}

function getVariantStyles(variant: TextVariant) {
  return classNames({
    "text-heading1 leading-tight": variant === "heading1",
    "text-heading2 leading-tight": variant === "heading2",
    "text-heading3 leading-tight": variant === "heading3",
    "text-heading4 leading-tight": variant === "heading4",
    "text-subheading1 leading-tight": variant === "subheading1",
    "text-subheading2 leading-tight": variant === "subheading2",
    "text-body1": variant === "body1",
    "text-body2": variant === "body2",
    "text-body3": variant === "body3",
  });
}
export const Text = ({
  variant = "body1",
  mobileVariant = variant,
  bold = false,
  italic = false,
  underline = false,
  medium = false,
  className,
  ...props
}: TextProps) => {
  const styles = classNames({
    "font-sans": true,
    [appendSm(getVariantStyles(variant))]: true,
    [getVariantStyles(mobileVariant)]: true,
    "font-bold": bold,
    "font-medium": medium,
    italic: italic, // Styling needs to be polished
    underline: underline,
    [`${className}`]: true,
  });

  return <span {...props} className={styles}></span>;
};
