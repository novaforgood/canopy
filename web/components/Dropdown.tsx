import { Fragment } from "react";

import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";

import {
  Profile_Role_Enum,
  useAllProfilesOfUserQuery,
} from "../generated/graphql";
import {
  BxCaretDown,
  BxLogIn,
  BxLogOut,
  BxTransfer,
} from "../generated/icons/regular";
import {
  BxsAddToQueue,
  BxsUser,
  BxsUserAccount,
  BxsWrench,
} from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";

import { Text } from "./atomic";
import { ProfileImage } from "./ProfileImage";

export function Dropdown() {
  const { userData } = useUserData();
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

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
              <Menu.Items className="absolute z-10 right-0 top-full mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                {isLoggedIn ? (
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
                                `/space/${currentSpace?.slug}/account`
                              );
                            }}
                          >
                            <BxsUserAccount className="w-5 h-5 mr-2" />
                            <Text variant="body2">My account</Text>
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
                              router.push(
                                `/space/${currentSpace?.slug}/account/profile`
                              );
                            }}
                          >
                            <BxsUser className="w-5 h-5 mr-2" />
                            <Text variant="body2">Edit my profile</Text>
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
                                router.push("/");
                              });
                            }}
                          >
                            <BxLogOut className="h-5 w-5 mr-2" />
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
                          <BxLogIn className="h-5 w-5 mr-2" />
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
