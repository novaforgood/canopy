import { SVGProps, useState } from "react";

import { Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";

import { Profile_Role_Enum } from "../../generated/graphql";
import {
  BxBell,
  BxMenu,
  BxMessageDetail,
  BxX,
} from "../../generated/icons/regular";
import { BxsCog, BxsHome } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useQueryParam } from "../../hooks/useQueryParam";
import { useUserData } from "../../hooks/useUserData";
import { signOut } from "../../lib/firebase";
import {
  announcementNotificationsCountAtom,
  notificationsCountAtom,
} from "../../lib/jotai";
import { LocalStorage } from "../../lib/localStorage";
import { Button, Text } from "../atomic";
import { IconButton } from "../buttons/IconButton";
import { SidePadding } from "../layout/SidePadding";
import { LoadingPlaceholderRect } from "../LoadingPlaceholderRect";
import { NumberBadge } from "../NumberBadge";
import { ProfileImage } from "../ProfileImage";
import { Tooltip } from "../tooltips";

import { Dropdown } from "./Dropdown";

const BxMegaphone = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    viewBox="0 0 43 43"
    width="100%"
    height="100%"
    {...props}
  >
    <path
      d="M39.7113 20.6142C39.7113 18.5187 38.8789 16.5091 37.3972 15.0274C35.9155 13.5457 33.9059 12.7133 31.8105 12.7133H25.2264C25.1441 12.7133 16.6013 12.5981 8.48647 5.78358C8.10181 5.45895 7.63169 5.25213 7.13247 5.1879C6.63325 5.12367 6.12609 5.20477 5.67179 5.42146C5.21485 5.62923 4.82831 5.96558 4.55939 6.38943C4.29046 6.81327 4.1508 7.30626 4.15745 7.80818V33.4201C4.1508 33.9221 4.29046 34.415 4.55939 34.8389C4.82831 35.2627 5.21485 35.5991 5.67179 35.8069C6.02291 35.9683 6.40461 36.0525 6.79107 36.0538C7.41047 36.0578 8.01121 35.842 8.48647 35.4447C14.7249 30.2104 21.1937 28.9265 23.9096 28.6138V34.3913C23.9081 34.8244 24.014 35.2511 24.218 35.6332C24.4219 36.0153 24.7175 36.3408 25.0783 36.5805L26.8889 37.7985C27.2454 38.0241 27.6488 38.1651 28.0682 38.2107C28.4876 38.2564 28.9118 38.2055 29.3085 38.0619C29.7024 37.9089 30.0533 37.6627 30.3314 37.3446C30.6094 37.0264 30.8063 36.6456 30.9052 36.2348L32.8639 28.4492C34.7578 28.1874 36.4934 27.2506 37.7515 25.811C39.0096 24.3714 39.7055 22.526 39.7113 20.6142ZM6.79107 33.4201V7.80818C13.8196 13.7009 21.0126 14.9848 23.9096 15.2646V25.9637C21.0126 26.2435 13.8196 27.5274 6.79107 33.4201ZM28.3538 35.5929L26.5432 34.3913V28.515H30.1315L28.3538 35.5929ZM31.8105 25.8814H26.5432V15.3469H31.8105C33.2074 15.3469 34.5472 15.9019 35.535 16.8897C36.5228 17.8775 37.0777 19.2172 37.0777 20.6142C37.0777 22.0111 36.5228 23.3509 35.535 24.3387C34.5472 25.3265 33.2074 25.8814 31.8105 25.8814Z"
      fill="black"
    />
  </svg>
);

function MobileNavbar() {
  const router = useRouter();

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { userData } = useUserData();
  const { currentProfile, currentProfileHasRole, fetchingCurrentProfile } =
    useCurrentProfile();

  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);
  const isMember = currentProfileHasRole(Profile_Role_Enum.Member);

  const img = currentProfile?.profile_listing?.profile_listing_image?.image.url;

  const spaceSlug = useQueryParam("slug", "string");

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
                    navigate(`/space/${spaceSlug}`);
                  }}
                >
                  Browse Community Profiles
                </Button>

                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    navigate(`/space/${spaceSlug}/chat`);
                  }}
                  variant="cta"
                >
                  Messages
                </Button>
                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    navigate(`/space/${spaceSlug}/announcements`);
                  }}
                  variant="cta"
                >
                  Announcements
                </Button>

                {isAdmin && (
                  <Button
                    className="w-full justify-center"
                    variant="outline"
                    onClick={() => {
                      navigate(`/space/${spaceSlug}/admin`);
                    }}
                  >
                    Admin dashboard
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="h-8"></div>
          <div className="flex flex-col items-start gap-4">
            {isMember && (
              <>
                <button
                  onClick={() => {
                    navigate(`/space/${spaceSlug}/account/profile`);
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
                  Change directory
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (spaceSlug) {
                  navigate(`/space/${spaceSlug}/account/settings`);
                } else {
                  navigate("/settings");
                }
              }}
            >
              Account settings
            </button>

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

function DesktopNavbar() {
  const router = useRouter();
  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const { currentProfileHasRole, fetchingCurrentProfile, currentProfile } =
    useCurrentProfile();
  const isAdmin = currentProfileHasRole(Profile_Role_Enum.Admin);
  const isMember = currentProfileHasRole(Profile_Role_Enum.Member);

  const arr = router.asPath.split("/");
  const isInAdminDashboard = arr.includes("admin");
  const spaceSlug = useQueryParam("slug", "string");
  const isHome = arr[arr.length - 1] === spaceSlug;

  const [notificationsCount] = useAtom(notificationsCountAtom);
  const [announcementNotificationsCount] = useAtom(
    announcementNotificationsCountAtom
  );

  return (
    <SidePadding>
      <div className="flex items-center justify-between pt-12">
        <div className="flex">
          {fetchingCurrentProfile ? (
            <LoadingPlaceholderRect className="h-10 w-64" />
          ) : !isMember ? (
            <img
              src={"/assets/canopy_logo.svg"}
              className="h-10"
              alt="Canopy Logo"
              draggable={false}
            />
          ) : (
            // <SpaceDropdown />
            <Text variant="heading4">{currentSpace?.name}</Text>
          )}
          {!isHome && spaceSlug && (
            <Button
              size="small"
              className={"ml-6 flex items-center"}
              onClick={() => {
                router.push(`/space/${spaceSlug}`);
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
                router.push(`/space/${spaceSlug}/admin`);
              }}
            >
              <BxsCog className="mr-2 h-5 w-5" />
              <Text variant="body1">Admin Dashboard</Text>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {spaceSlug && (
            <div className="flex gap-2">
              <Tooltip content="Messages" delayMs={[500, 0]} placement="bottom">
                <div>
                  <Link href={`/space/${spaceSlug}/chat`} passHref>
                    <a className="relative">
                      {notificationsCount > 0 ? (
                        <NumberBadge
                          className="absolute -top-0.5 -right-1"
                          number={notificationsCount}
                        />
                      ) : null}
                      <IconButton
                        icon={<BxMessageDetail className="h-6 w-6" />}
                      />
                    </a>
                  </Link>
                </div>
              </Tooltip>
              <Tooltip
                content="Announcements"
                delayMs={[500, 0]}
                placement="bottom"
              >
                <div>
                  <Link href={`/space/${spaceSlug}/announcements`} passHref>
                    <a className="relative">
                      {announcementNotificationsCount > 0 ? (
                        <NumberBadge
                          number={announcementNotificationsCount}
                          className="absolute -top-0.5 -right-1"
                        />
                      ) : null}
                      <IconButton icon={<BxMegaphone className="h-6 w-6" />} />
                    </a>
                  </Link>
                </div>
              </Tooltip>
            </div>
          )}
          <Dropdown />
        </div>
      </div>
    </SidePadding>
  );
}

export function Navbar() {
  const renderDesktop = useMediaQuery({ showIfBiggerThan: "md" }, true);
  return (
    <>
      {renderDesktop ? (
        <DesktopNavbar />
      ) : (
        <>
          <div className="h-16"></div>
          <div className="fixed top-0 z-10 h-16 w-full bg-white shadow-md">
            <MobileNavbar />
          </div>
        </>
      )}
    </>
  );
}
