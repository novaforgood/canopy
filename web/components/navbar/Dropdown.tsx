import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";

import { useAllProfilesOfUserQuery } from "../../generated/graphql";
import {
  BxCaretDown,
  BxLogIn,
  BxLogOut,
  BxTransfer,
} from "../../generated/icons/regular";
import { BxsCog, BxsUser } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useIsLoggedIn } from "../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../hooks/useQueryParam";
import { useUserData } from "../../hooks/useUserData";
import { signOut } from "../../lib/firebase";
import { LocalStorage } from "../../lib/localStorage";
import { Text } from "../atomic";
import { ProfileImage } from "../ProfileImage";

export function Dropdown() {
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();

  const spaceSlug = useQueryParam("slug", "string");

  const img = currentProfile?.profile_listing?.profile_listing_image?.image.url;

  const { currentProfileHasRole } = useCurrentProfile();

  const router = useRouter();

  const isLoggedIn = useIsLoggedIn();

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
              <Menu.Items className="absolute right-0 top-full z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                {isLoggedIn ? (
                  <>
                    {spaceSlug && (
                      <>
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
                                  router.push(
                                    `/space/${spaceSlug}/account/profile`
                                  );
                                }}
                              >
                                <BxsUser className="mr-2 h-5 w-5" />
                                <Text variant="body2">Edit profile</Text>
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
                                  router.push(`/`);
                                }}
                              >
                                <BxTransfer className="mr-2 h-5 w-5 flex-none" />
                                <Text variant="body2">Change directory</Text>
                              </button>
                            );
                          }}
                        </Menu.Item>
                      </>
                    )}

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
                              if (spaceSlug) {
                                router.push(
                                  `/space/${spaceSlug}/account/settings`
                                );
                              } else {
                                router.push("/settings");
                              }
                            }}
                          >
                            <BxsCog className="mr-2 h-5 w-5" />
                            <Text variant="body2">Account settings</Text>
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
                              signOut().then(() => {
                                LocalStorage.clear();
                                router.push("/");
                              });
                            }}
                          >
                            <BxLogOut className="mr-2 h-5 w-5" />
                            <Text variant="body2">Log out</Text>
                          </button>
                        );
                      }}
                    </Menu.Item>
                  </>
                ) : (
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
                            router.push("/login");
                          }}
                        >
                          <BxLogIn className="mr-2 h-5 w-5" />
                          <Text variant="body2">Log in</Text>
                        </button>
                      );
                    }}
                  </Menu.Item>
                )}
              </Menu.Items>
            </Transition>

            <div>
              <Menu.Button className="focus:outline-none">
                <div className="flex items-center gap-2">
                  <Text className="mr-1">
                    {userData?.first_name} {userData?.last_name}
                  </Text>
                  <ProfileImage
                    src={img}
                    alt="Profile image"
                    className="h-10 w-10"
                  />
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
