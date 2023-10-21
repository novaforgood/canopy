import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxCheck } from "../../generated/icons/regular";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
};

export function IconButton(props: IconButtonProps) {
  const { className, icon } = props;

  const styles = classNames({
    "p-1.5 transition rounded-md hover:bg-gray-100 flex justify-center items-center":
      true,
    [`${className}`]: true,
  });

  return (
    <button {...props} className={styles}>
      {icon}
    </button>
  );
}
