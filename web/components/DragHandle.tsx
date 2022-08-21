import { ButtonHTMLAttributes } from "react";

import classNames from "classnames";

import { BxMove, BxMoveVertical } from "../generated/icons/regular";
import { BxsPencil, BxsTrash, BxsTrashAlt } from "../generated/icons/solid";

type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DragHandle(props: DragHandleProps) {
  const { className, ...rest } = props;

  const styles = classNames({
    "w-5 h-5 text-gray-600 hover:text-gray-500 inline cursor-grab": true,
    [`${className}`]: true,
  });

  return (
    <button {...rest}>
      <BxMove className={styles} />
    </button>
  );
}
