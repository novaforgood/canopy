import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxCheck } from "../../generated/icons/regular";

type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ApproveButton(props: EditButtonProps) {
  const { className } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-50 inline flex items-center": true,
    [`${className}`]: true,
  });

  return (
    <button
      {...props}
      className="p-1 rounded-full bg-lime-500 hover:bg-lime-400"
    >
      <BxCheck className={styles} />
    </button>
  );
}
