import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxsPencil } from "../generated/icons/solid";

type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function EditButton(props: EditButtonProps) {
  const { className, ...rest } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-600 hover:text-gray-500 inline": true,
    [`${className}`]: true,
  });

  return (
    <button {...props}>
      <BxsPencil className={styles} />
    </button>
  );
}
