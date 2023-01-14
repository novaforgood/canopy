import { Fragment, ReactNode } from "react";

import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";

import { Text } from "./Text";

interface DropdownProps {
  items: {
    label: string;
    icon?: ReactNode;
    renderItem?: (props: { active: boolean; disabled: boolean }) => ReactNode;
    onClick: () => void;
  }[];

  renderButton: (props: { dropdownOpen: boolean }) => ReactNode;
}
export const Dropdown = (props: DropdownProps) => {
  const { items, renderButton } = props;

  return (
    <Menu as="div" className="relative inline-block overflow-visible text-left">
      {({ open }) => {
        return (
          <>
            <Menu.Button className="focus:outline-none">
              <div>{renderButton({ dropdownOpen: open })}</div>
            </Menu.Button>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="bg-red-500 absolute right-0 top-full z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                {items.map((item, idx) => {
                  const { label, icon, renderItem, onClick } = item;

                  return (
                    <Menu.Item key={idx}>
                      {(props) => {
                        const { active } = props;
                        const styles = classNames({
                          "group flex w-full items-center rounded-md px-4 py-3 text-sm":
                            true,
                          "bg-white": !active,
                          "bg-gray-50": active,
                        });

                        return (
                          <button className={styles} onClick={onClick}>
                            {icon}
                            <Text variant="body2" className="whitespace-nowrap">
                              {label}
                            </Text>
                          </button>
                        );
                      }}
                    </Menu.Item>
                  );
                })}
              </Menu.Items>
            </Transition>
          </>
        );
      }}
    </Menu>
  );
};
