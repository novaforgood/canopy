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
export const Select = <T extends string | Date | number>({
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
          if (selectedValue === value) {
            onSelect(null);
          } else {
            onSelect(selectedValue);
          }
        }}
      >
        {({ open }) => (
          <div className="relative bg-white">
            <Listbox.Button
              className={classNames({
                "relative flex w-full cursor-pointer items-center justify-between":
                  true,
                "rounded border px-4 py-2 text-left outline-none ring-0": true,
                "border-black": open,
                "border-gray-400": !open,
              })}
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
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white
              py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                {options.map((option, i) => (
                  <Listbox.Option
                    key={i}
                    className={({ active }) =>
                      `${
                        active && "bg-gray-100"
                      } relative cursor-pointer select-none px-2 py-1`
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
        )}
      </Listbox>
    </div>
  );
};
