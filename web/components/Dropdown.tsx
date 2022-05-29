import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxCaretDown, BxLogOut, BxTransfer } from "../generated/icons/regular";
import { BxsUserAccount, BxsWrench } from "../generated/icons/solid";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

import { Text } from "./atomic";

export function Dropdown() {
  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();

  const router = useRouter();

  const [{ data: allProfilesData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

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
              <Menu.Items className="absolute z-10 right-0 top-full mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                          router.push(`/space/${currentSpace?.slug}/account`);
                        }}
                      >
                        <BxsUserAccount className="w-5 h-5 mr-2" />
                        My Account
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
                          router.push(`/space/${currentSpace?.slug}/admin`);
                        }}
                      >
                        <BxsWrench className="w-5 h-5 mr-2" />
                        Admin page
                      </button>
                    );
                  }}
                </Menu.Item>
                {allProfilesData?.profile.map((profile) => {
                  return (
                    <Menu.Item key={profile.id}>
                      {({ active }) => {
                        const styles = classNames({
                          "group flex w-full items-center rounded-md px-2 py-3 text-sm whitespace-nowrap truncate":
                            true,
                          "bg-white": !active,
                          "bg-gray-50": active,
                        });
                        return (
                          <button
                            className={styles}
                            onClick={() => {
                              router.push(`/space/${profile.space.slug}`);
                            }}
                          >
                            <BxTransfer className="w-5 h-5 mr-2 flex-none" />
                            {profile.space.name}
                          </button>
                        );
                      }}
                    </Menu.Item>
                  );
                })}

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
                          signOut(auth);
                        }}
                      >
                        <BxLogOut className="h-5 w-5 mr-2" />
                        Log Out
                      </button>
                    );
                  }}
                </Menu.Item>
              </Menu.Items>
            </Transition>

            <div>
              <Menu.Button className="focus:outline-none">
                <div className="flex items-center gap-2">
                  <Text>
                    {userData?.first_name} {userData?.last_name}
                  </Text>
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
