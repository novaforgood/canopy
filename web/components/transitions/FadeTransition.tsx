import React, { ReactNode } from "react";

import { Transition } from "@headlessui/react";
import classNames from "classnames";

interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

export function FadeTransition(props: FadeTransitionProps) {
  const { show, children, className } = props;

  const styles = classNames({
    "w-full": true,
    [`${className}`]: true,
  });

  return (
    <Transition
      show={show}
      className={styles}
      enter="transition-all duration-700"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0 hidden"
    >
      {show && children}
    </Transition>
  );
}
