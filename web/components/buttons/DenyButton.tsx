import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxCheck, BxX } from "../../generated/icons/regular";

type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DenyButton(props: EditButtonProps) {
  const { className } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-50 inline flex items-center": true,
    [`${className}`]: true,
  });

  return (
    <button
      {...props}
      className="p-1 rounded-full bg-[#FF7B5E] hover:brightness-110"
    >
      <BxX className={styles} />
    </button>
  );
}
