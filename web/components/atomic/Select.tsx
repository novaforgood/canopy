import { Fragment } from "react";

import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import { isEqual } from "date-fns";

import { BxCaretDown } from "../../generated/icons/regular";
import { BxsDownArrow } from "../../generated/icons/solid";

interface SelectProps<T> {
  options: { label: string; value: T }[];
  value: T | null;
  onSelect?: (selectedValue: T | null) => void;
  className?: string;
  placeholder?: string;
}
export const Select = <T extends string | Date>({
  options,
  value,
  onSelect = () => {},
  className,
  placeholder,
}: SelectProps<T>) => {
  const valueToLabel = (value: T | null) => {
    if (value === null) {
      return "";
    }

    return options.find((x) =>
      x.value instanceof Date && value instanceof Date
        ? isEqual(x.value, value)
        : x.value === value
    )?.label;
  };

  const styles = classNames({
    "w-auto": !className,
    [`${className}`]: className,
  });

  const placeholderStyles = classNames({
    "block truncate": true,
    "text-gray-600": !value,
  });

  return (
    <div className={styles}>
      <Listbox
        value={value}
        onChange={(selectedValue) => {
          if (!selectedValue) {
            onSelect(null);
          }
          onSelect(selectedValue);
        }}
      >
        <div className="relative bg-white">
          <Listbox.Button
            className="relative w-full px-2 py-1 text-left border border-inactive rounded cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-inactive focus:border-inactive flex justify-between items-center"
          >
            <span className={placeholderStyles}>
              {value ? valueToLabel(value) : placeholder}
            </span>
            <BxCaretDown className="h-5 w-5" />
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white z-10
              rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              {options.map((option, i) => (
                <Listbox.Option
                  key={i}
                  className={({ active }) =>
                    `${
                      active && "bg-gray-100"
                    } cursor-pointer select-none relative px-2 py-1`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <span
                      className={`${
                        selected ? "font-medium" : "font-normal"
                      } block truncate`}
                    >
                      {option.label}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
