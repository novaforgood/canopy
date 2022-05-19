import React, { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  rounded?: boolean;
  floating?: boolean;
  variant?: "primary" | "outline" | "secondary";
};

export const Button = ({
  className,
  children,
  loading = false,
  disabled = false,
  rounded = false,
  floating = false,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const secondaryStyles = classNames({
    ["underline border border-transparent rounded-md px-8 py-2"]: true,
    ["hover:text-gray-500 text-gray-600"]: !disabled,
    ["text-gray-400"]: disabled,
    [`${className}`]: className,
  });

  const primaryStyles = classNames({
    ["border border-black px-8 py-2 flex items-center"]: true,
    ["text-white"]: variant === "primary",
    ["bg-gray-900 hover:bg-black"]: !disabled && variant === "primary",
    ["bg-gray-700 border-gray-700"]: disabled && variant === "primary",
  });

  const outlineStyles = classNames({
    ["border border-black px-8 py-2 flex items-center"]: true,
    ["bg-white"]: !disabled && variant === "outline",
    ["hover:brightness-95"]: !disabled && variant === "outline",
    ["border-gray-500 text-gray-500"]: disabled && variant === "outline",
  });

  const styles = classNames({
    [primaryStyles]: variant === "primary",
    [outlineStyles]: variant === "outline",
    [secondaryStyles]: variant === "secondary",
    ["rounded-md"]: !rounded,
    ["rounded-full"]: rounded,
    ["cursor-not-allowed"]: disabled,
    ["active:translate-y-px"]: !disabled,
    ["drop-shadow-md active:drop-shadow-none"]: floating,
  });
  return (
    <button className={styles} disabled={disabled} {...props}>
      {children}
      {loading && <div>loading...</div>}
    </button>
  );
};
