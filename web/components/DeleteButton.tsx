import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxsPencil, BxsTrash, BxsTrashAlt } from "../generated/icons/solid";

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DeleteButton(props: DeleteButtonProps) {
  const { className, ...rest } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-300 hover:text-gray-200 inline flex items-center": true,
    [`${className}`]: true,
  });

  return (
    <button {...props}>
      <BxsTrashAlt className={styles} />
    </button>
  );
}
