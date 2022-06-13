import React, { ReactNode } from "react";

import { Transition } from "@headlessui/react";

interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
}

export function FadeTransition(props: FadeTransitionProps) {
  const { show, children } = props;

  return (
    <Transition
      show={show}
      className="w-full"
      enter="transition-all duration-700"
      enterFrom="translate-y-2 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  );
}
