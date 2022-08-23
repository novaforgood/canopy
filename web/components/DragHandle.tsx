import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxMove, BxMoveVertical } from "../generated/icons/regular";
import { BxsPencil, BxsTrash, BxsTrashAlt } from "../generated/icons/solid";

type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  sizeClassName?: string;
};

export function DragHandle(props: DragHandleProps) {
  const { className, sizeClassName, ...rest } = props;

  const styles = classNames({
    "text-gray-600 hover:text-gray-500 inline cursor-grab flex items-center":
      true,
    "w-5 h-5": !sizeClassName,
    [`${className}`]: true,
    [`${sizeClassName}`]: true,
  });

  return (
    <button {...rest}>
      <BxMove className={styles} />
    </button>
  );
}
