import React, {
  Fragment,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
  useEffect,
} from "react";

import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { createPortal } from "react-dom";

type ModalProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  initialFocus?: MutableRefObject<HTMLElement | null>;
  backgroundBlur?: boolean;
};

export const Modal = ({
  children,
  isOpen,
  onClose = () => {},
  backgroundBlur = false,
}: ModalProps) => {
  const enterToClassName = classNames({
    "opacity-100": true,
    "backdrop-blur-sm": backgroundBlur,
  });

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo={enterToClassName}
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel>{children}</Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

type ModalTitleProps = HTMLAttributes<HTMLDivElement>;
// eslint-disable-next-line react/display-name
Modal.Title = ({ children }: ModalTitleProps) => {
  return <Dialog.Title>{children}</Dialog.Title>;
};

type ModalDescriptionProps = HTMLAttributes<HTMLDivElement>;
// eslint-disable-next-line react/display-name
Modal.Description = ({ children }: ModalDescriptionProps) => {
  return <Dialog.Description>{children}</Dialog.Description>;
};
