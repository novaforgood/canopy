import { Popover as HeadlessPopover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BxChevronDown } from "../../generated/icons/regular";

export function Popover(props: {
  children: React.ReactNode;
  renderButton?: (props: { open: boolean }) => React.ReactNode;
}) {
  const { children, renderButton } = props;
  return (
    <HeadlessPopover className="relative">
      {({ open }) => (
        <>
          <HeadlessPopover.Button>
            {renderButton?.({ open })}
          </HeadlessPopover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <HeadlessPopover.Panel className="absolute left-1/2 z-10 mt-3 -translate-x-1/2 transform bg-white">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                {children}
              </div>
            </HeadlessPopover.Panel>
          </Transition>
        </>
      )}
    </HeadlessPopover>
  );
}
