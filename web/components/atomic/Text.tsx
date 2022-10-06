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
  | "body3"
  | "body4";

type TextProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TextVariant;
  mobileVariant?: TextVariant;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  medium?: boolean;
  className?: string;
  loading?: boolean;
  loadingWidthClassName?: string;
};

// Hack: List all sm:variants here so they don't get pruned by Tailwind.
("sm:text-heading1 sm:text-heading2 sm:text-heading3 sm:text-heading4 sm:text-subheading1 sm:text-subheading2 sm:text-body1 sm:text-body2 sm:text-body3");

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
    "text-body4": variant === "body4",
  });
}
export const Text = ({
  variant = "body1",
  mobileVariant = variant,
  bold = false,
  italic = false,
  underline = false,
  medium = false,
  loading = false,
  className,
  children,
  loadingWidthClassName,
  ...props
}: TextProps) => {
  const styles = classNames({
    "font-sans relative": true,
    [getVariantStyles(mobileVariant)]: true,
    [appendSm(getVariantStyles(variant))]: true,
    invisible: loading,
    "font-bold": bold,
    "font-medium": medium,
    italic: italic, // Styling needs to be polished
    underline: underline,
    [`${className}`]: true,
  });

  const loadingPlaceholderStyles = classNames({
    "animate-pulse bg-gray-200 rounded-md absolute h-full inset-0": true,
    "w-full": !loadingWidthClassName,
    [`${loadingWidthClassName}`]: loadingWidthClassName,
    invisible: !loading,
    visible: loading,
  });

  return (
    <span {...props} className={styles}>
      {loading ? "‎" : children}
      <div className={loadingPlaceholderStyles} />
    </span>
  );
};
