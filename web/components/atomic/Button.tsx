import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  rounded?: boolean;
  variant?: "primary" | "outline";
};

// eslint-disable-next-line react/display-name
export const Button = React.forwardRef(
  (
    {
      className,
      children,
      loading = false,
      disabled = false,
      rounded = false,
      variant = "primary",
      ...props
    }: ButtonProps,
    _ //ref: creating this so the warning of passing refs with Links disappears
  ) => {
    const styles = classNames({
      ["border border-black px-8 py-2 flex items-center"]: true,
      // Variant: primary
      ["text-white"]: variant === "primary",
      ["bg-gray-900 hover:bg-black"]: !disabled && variant === "primary",
      ["bg-gray-700 border-gray-700"]: disabled && variant === "primary",

      // Variant: outline
      ["bg-white"]: !disabled && variant === "outline",
      ["hover:brightness-95"]: !disabled && variant === "outline",
      ["border-gray-500 text-gray-500"]: disabled && variant === "outline",

      ["rounded-md"]: !rounded,
      ["rounded-full"]: rounded,
      ["cursor-not-allowed"]: disabled,
      ["active:translate-y-px"]: !disabled,
      [`${className}`]: true,
    });

    return (
      <button className={styles} disabled={disabled} {...props}>
        {children}
        {loading && <div>loading...</div>}
      </button>
    );
  }
);
