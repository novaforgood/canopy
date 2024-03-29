import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";

import { BxCaretDown, BxTransfer } from "../generated/icons/regular";
import { BxsAddToQueue } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";

import { Text } from "./atomic";

export function SpaceDropdown() {
  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const router = useRouter();

  // const [{ data: allProfilesData }] = useAllProfilesOfUserQuery({
  //   variables: { user_id: userData?.id ?? "" },
  // });

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        const caretStyles = classNames({
          "h-7 w-7 transition": true,
          "rotate-180": open,
        });

        return (
          <>
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
              <Menu.Items className="absolute left-0 top-full z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => {
                    const styles = classNames({
                      "group flex w-full items-center rounded-md px-2 py-3 text-sm":
                        true,
                      "bg-white": !active,
                      "bg-gray-50": active,
                    });
                    return (
                      <button
                        className={styles}
                        onClick={() => {
                          router.push(`/`);
                        }}
                      >
                        <BxTransfer className="mr-2 h-5 w-5 flex-none" />
                        <Text variant="body2">Change directory</Text>
                      </button>
                    );
                  }}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => {
                    const styles = classNames({
                      "group flex w-full items-center rounded-md px-2 py-3 text-sm":
                        true,
                      "bg-white": !active,
                      "bg-gray-50": active,
                    });
                    return (
                      <button
                        className={styles}
                        onClick={() => {
                          router.push(`/create`);
                        }}
                      >
                        <BxsAddToQueue className="mr-2 h-5 w-5" />
                        <Text bold variant="body2">
                          Create new directory
                        </Text>
                      </button>
                    );
                  }}
                </Menu.Item>
              </Menu.Items>
            </Transition>

            <div>
              <Menu.Button className="focus:outline-none">
                <div className="flex items-center gap-4">
                  <Text variant="heading4">{currentSpace?.name}</Text>
                  <BxCaretDown className={caretStyles} />
                </div>
              </Menu.Button>
            </div>
          </>
        );
      }}
    </Menu>
  );
}
