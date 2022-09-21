import { useEffect, useState } from "react";

import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { Profile_Role_Enum } from "../generated/graphql";
import { BxMenu, BxX } from "../generated/icons/regular";
import { BxsCog, BxsHome, BxsWrench } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useQueryParam } from "../hooks/useQueryParam";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";
import { LocalStorage } from "../lib/localStorage";

import { Button, Text } from "./atomic";
import { Dropdown } from "./Dropdown";
import { Responsive } from "./layout/Responsive";
import { SidePadding } from "./layout/SidePadding";
import { LoadingPlaceholderRect } from "./LoadingPlaceholderRect";
import { ProfileImage } from "./ProfileImage";
import { SpaceDropdown } from "./SpaceDropdown";
import { FadeTransition } from "./transitions/FadeTransition";

function MobileNavbar() {
  const router = useRouter();

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { userData } = useUserData();
  const { currentProfile, currentProfileHasRole, fetchingCurrentProfile } =
    useCurrentProfile();

  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);
  const isMember = currentProfileHasRole(Profile_Role_Enum.Member);

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
    <div className="relative w-full overscroll-none">
      <div className="flex items-center justify-between bg-gray-50 py-3 px-4">
        <Text>{currentSpace?.name}</Text>
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
        className="absolute top-full h-screen w-full bg-white"
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
            {isMember && (
              <>
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
              </>
            )}
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

            {isMember && (
              <>
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
              </>
            )}

            <button
              onClick={() => {
                signOut().then(() => {
                  LocalStorage.clear();
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
  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { currentProfileHasRole, fetchingCurrentProfile } = useCurrentProfile();
  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);
  const isMember = currentProfileHasRole(Profile_Role_Enum.Member);

  const arr = router.asPath.split("/");
  const isInAdminDashboard = arr.includes("admin");
  const spaceSlug = useQueryParam("slug", "string");
  const isHome = arr[arr.length - 1] === spaceSlug;
  console.log(arr);
  console.log(spaceSlug);

  return (
    <>
      <Responsive mode="desktop-only">
        <SidePadding>
          <div className="flex items-center justify-between pt-12">
            <div className="flex">
              {fetchingCurrentProfile ? (
                <LoadingPlaceholderRect className="h-10 w-64" />
              ) : !isMember ? (
                <img
                  src={"/assets/canopyLogo.svg"}
                  alt="Canopy Logo"
                  draggable={false}
                />
              ) : (
                <SpaceDropdown />
              )}
              {!isHome && (
                <Button
                  size="small"
                  className={"ml-6 flex items-center"}
                  onClick={() => {
                    router.push(`/space/${currentSpace?.slug}`);
                  }}
                >
                  <BxsHome className="mr-2 h-5 w-5" />
                  <Text variant="body1">Directory Homepage</Text>
                </Button>
              )}
              {isAdmin && isHome && (
                <Button
                  size="small"
                  className={"ml-6 flex items-center"}
                  onClick={() => {
                    router.push(`/space/${currentSpace?.slug}/admin`);
                  }}
                >
                  <BxsCog className="mr-2 h-5 w-5" />
                  <Text variant="body1">Admin Dashboard</Text>
                </Button>
              )}
            </div>
            <Dropdown />
          </div>
        </SidePadding>
      </Responsive>
      <Responsive mode="mobile-only" className="">
        <div className="h-16"></div>
        <div className="fixed top-0 z-10 h-16 w-full bg-white">
          <MobileNavbar />
        </div>
      </Responsive>
    </>
  );
}
