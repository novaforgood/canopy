import { Fragment, useRef, useState } from "react";

import { Combobox, Transition } from "@headlessui/react";

import { BxCaretDown } from "../../generated/icons/regular";
import { BxsDownArrow } from "../../generated/icons/solid";

type OptionType<T> = { label: string; value: T };

interface SelectProps<T> {
  options: OptionType<T>[];
  value: T | null;
  onSelect?: (selectedValue: T | null) => void;
  className?: string;
  placeholder?: string;
}

export function SelectAutocomplete<T extends string>(props: SelectProps<T>) {
  const { options, value, onSelect = () => {}, className, placeholder } = props;
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const inputRef = useRef<HTMLInputElement>(null);

  const item = options.find((i) => i.value === value) ?? null;

  return (
    <Combobox
      value={item}
      onChange={(newItem) => {
        if (newItem) {
          onSelect(newItem.value);
        } else {
          onSelect(null);
        }
      }}
    >
      <div className="relative w-full">
        <Combobox.Input<"input", OptionType<T> | null>
          className="relative w-full px-2 py-1 text-left border transition rounded cursor-pointer focus:outline-none focus:ring-inactive focus:border-black flex justify-between items-center"
          displayValue={(item) => item?.label ?? ""}
          onChange={(event) => setQuery(event.target.value)}
          value={query}
          ref={inputRef}
          placeholder={placeholder}
        />
        <Combobox.Button
          className="absolute top-0 left-0 w-full h-full flex justify-end items-center pr-2"
          onClick={() => {
            inputRef.current?.select();
          }}
        >
          <BxCaretDown className="h-5 w-5" />
        </Combobox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  className={({ active }) =>
                    `${
                      active && "bg-gray-100"
                    } cursor-pointer select-none relative px-2 py-1`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
