import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxTrash } from "../generated/icons/regular";
import { BxsPencil, BxsTrash, BxsTrashAlt } from "../generated/icons/solid";

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
};

export function DeleteButton(props: DeleteButtonProps) {
  const { className, variant = "solid", ...rest } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-300 hover:text-gray-200 inline flex items-center": true,
    [`${className}`]: true,
  });

  return (
    <button {...props}>
      {variant === "solid" ? (
        <BxsTrashAlt className={styles} />
      ) : (
        <BxTrash className={styles} />
      )}
    </button>
  );
}
