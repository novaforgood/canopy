import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

// eslint-disable-next-line react/display-name
export const Button = React.forwardRef(
  (
    {
      className,
      children,
      loading = false,
      disabled = false,
      ...props
    }: ButtonProps,
    _ //ref: creating this so the warning of passing refs with Links disappears
  ) => {
    const styles = classNames({
      ["border px-2 py-0.5 hover:bg-gray-100 flex items-center"]: true,
      ["border-black"]: !disabled,
      ["border-gray-300 text-gray-300 pointer-events-none"]: disabled,
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
