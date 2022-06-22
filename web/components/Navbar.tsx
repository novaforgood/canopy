import { useEffect, useState } from "react";

import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { Profile_Role_Enum } from "../generated/graphql";
import { BxMenu, BxX } from "../generated/icons/regular";
import { BxsCog, BxsHome, BxsWrench } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";

import { Button, Text } from "./atomic";
import { Dropdown } from "./Dropdown";
import { ProfileImage } from "./ProfileImage";
import { Responsive } from "./Responsive";
import { SpaceDropdown } from "./SpaceDropdown";
import { FadeTransition } from "./transitions/FadeTransition";

function MobileNavbar() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { userData } = useUserData();
  const { currentProfile, currentProfileHasRole } = useCurrentProfile();

  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);

  const img = currentProfile?.profile_listing?.profile_listing_image?.image.url;

  const [expanded, setExpanded] = useState(false);

  // Doesn't work in safari anyways.
  // useEffect(() => {
  //   if (expanded) {
  //     document.body.classList.add("no-scroll");
  //   } else {
  //     document.body.classList.remove("no-scroll");
  //   }
  // }, [expanded]);

  const navigate = async (route: string) => {
    await router.push(route);
    setExpanded(false);
  };

  return (
    <div className="w-screen relative -mx-6 overscroll-none">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
        <div>{currentSpace?.name}</div>
        <button onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? (
            <BxX className="h-10 w-10" />
          ) : (
            <BxMenu className="h-10 w-10" />
          )}
        </button>
      </div>

      <Transition
        show={expanded}
        as="div"
        enter="transition-opacity ease-linear duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="overflow-hidden bg-white absolute top-full w-full h-screen"
      >
        <div className="px-8 pt-12">
          <div className="flex items-center gap-2">
            <ProfileImage src={img} alt="Profile image" className="h-10 w-10" />
            <Text className="mr-1">
              {userData?.first_name} {userData?.last_name}
            </Text>
          </div>
          <div className="h-6"></div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full justify-center"
              onClick={() => {
                navigate(`/space/${currentSpace?.slug}`);
              }}
            >
              Browse Community Profiles
            </Button>
            <Button
              className="w-full justify-center"
              variant="outline"
              onClick={() => {
                navigate(`/space/${currentSpace?.slug}/account`);
              }}
            >
              Your Account
            </Button>
          </div>

          <div className="h-8"></div>
          <div className="flex flex-col items-start gap-4">
            {isAdmin && (
              <button
                onClick={() => {
                  navigate(`/space/${currentSpace?.slug}/admin`);
                }}
              >
                Admin settings
              </button>
            )}

            <button
              onClick={() => {
                navigate(`/space/${currentSpace?.slug}/account/profile`);
              }}
            >
              Edit Your Profile
            </button>
            {/* <button>Your Connections</button> */}
            <button
              onClick={() => {
                navigate("/");
              }}
            >
              Switch Community Spaces
            </button>
            <button
              onClick={() => {
                signOut().then(() => {
                  navigate("/");
                });
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole } = useCurrentProfile();
  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);

  const arr = router.asPath.split("/");
  const isInAdminDashboard = arr.includes("admin");

  return (
    <>
      <Responsive mode="desktop-only">
        <div className="flex items-center justify-between mt-12 bg-white">
          <div className="flex">
            <SpaceDropdown />
            {isAdmin &&
              (isInAdminDashboard ? (
                <Button
                  size="small"
                  className={"flex items-center ml-6"}
                  onClick={() => {
                    router.push(`/space/${currentSpace?.slug}`);
                  }}
                >
                  <BxsHome className="w-5 h-5 mr-2" />
                  <Text variant="body1">Directory Homepage</Text>
                </Button>
              ) : (
                <Button
                  size="small"
                  className={"flex items-center ml-6"}
                  onClick={() => {
                    router.push(`/space/${currentSpace?.slug}/admin`);
                  }}
                >
                  <BxsCog className="w-5 h-5 mr-2" />
                  <Text variant="body1">Admin Dashboard</Text>
                </Button>
              ))}
          </div>
          <Dropdown />
        </div>
      </Responsive>
      <Responsive mode="mobile-only" className="w-full sticky top-0 z-10">
        <MobileNavbar />
      </Responsive>
    </>
  );
}
