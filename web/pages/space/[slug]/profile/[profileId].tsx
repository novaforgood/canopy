import { Fragment, useEffect } from "react";

import { Menu, Transition } from "@headlessui/react";
import { useDisclosure } from "@mantine/hooks";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button, Text } from "../../../../components/atomic";
import { IconButton } from "../../../../components/buttons/IconButton";
import { ProfileImage } from "../../../../components/common/ProfileImage";
import { Tag } from "../../../../components/common/Tag";
import { ProfileSocialsDisplay } from "../../../../components/edit-socials-info/ProfileSocialsDisplay";
import { PageNotFound } from "../../../../components/error-screens/PageNotFound";
import { HtmlDisplay } from "../../../../components/HtmlDisplay";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { PleaseLogInModal } from "../../../../components/PleaseLogInModal";
import { MessageModal } from "../../../../components/profile-page/MessageModal";
import { useProfileByIdQuery } from "../../../../generated/graphql";
import {
  BxDotsHorizontalRounded,
  BxEdit,
  BxFile,
  BxMessageDetail,
} from "../../../../generated/icons/regular";
import { useProfileViewTracker } from "../../../../hooks/analytics/useProfileViewTracker";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { CustomPage } from "../../../../types";

function ProfilePageDropdown() {
  const profileId = useQueryParam("profileId", "string");
  const isLoggedIn = useIsLoggedIn();
  const spaceSlug = useQueryParam("slug", "string");

  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const router = useRouter();

  if (!profileData?.profile_by_pk) {
    return null;
  }

  const { first_name, last_name } = profileData.profile_by_pk.user;

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
              <Menu.Items className="absolute right-0 top-full z-10 mt-2 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => {
                    const styles = classNames({
                      "group flex w-full items-center rounded-md px-4 py-3 text-sm":
                        true,
                      "bg-white": !active,
                      "bg-gray-50": active,
                    });
                    return (
                      <button
                        className={styles}
                        onClick={() => {
                          router.push(
                            `/space/${spaceSlug}/report/${profileId}`
                          );
                        }}
                      >
                        <BxFile className="mr-2 h-5 w-5 flex-none" />
                        <Text variant="body2" className="whitespace-nowrap">
                          Report {first_name} {last_name}
                        </Text>
                      </button>
                    );
                  }}
                </Menu.Item>
              </Menu.Items>
            </Transition>

            <Menu.Button className="focus:outline-none">
              <div>
                <IconButton
                  icon={
                    <BxDotsHorizontalRounded className="h-5 w-5 text-gray-700" />
                  }
                  className="ml-4 rounded-full"
                  onClick={() => {}}
                />
              </div>
            </Menu.Button>
          </>
        );
      }}
    </Menu>
  );
}

const ProfilePage: CustomPage = () => {
  const router = useRouter();

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const spaceSlug = useQueryParam("slug", "string");
  const profileId = useQueryParam("profileId", "string");

  const { currentProfile } = useCurrentProfile();
  const isLoggedIn = useIsLoggedIn();

  const { attemptTrackView } = useProfileViewTracker();
  useEffect(() => {
    if (!profileId) {
      return;
    }
    if (!currentProfile?.id) {
      return;
    }

    // This should only run once per page load.
    attemptTrackView(profileId, currentProfile.id);
  }, [attemptTrackView, currentProfile?.id, profileId]);

  const [open, handlers] = useDisclosure(false);
  const [loginModalOpen, loginModalHandlers] = useDisclosure(false);

  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "", is_logged_in: isLoggedIn },
  });

  const isMyProfile = profileId === currentProfile?.id;

  if (!currentSpace && !fetchingCurrentSpace) {
    return <PageNotFound />;
  }

  if (!profileData?.profile_by_pk?.profile_listing && !fetchingProfileData) {
    return <PageNotFound />;
  }

  const listing = profileData?.profile_by_pk?.profile_listing;
  const { first_name, last_name, email } =
    profileData?.profile_by_pk?.user ?? {};

  const profileTagIds = new Set(
    listing?.profile_listing_to_space_tags.map((item) => item.space_tag_id)
  );

  router;

  return (
    <div>
      <div className="bg-gray-100">
        <Navbar />
      </div>
      <SidePadding className="bg-gray-100">
        <div className="h-16"></div>
        <button
          className="hover:underline"
          onClick={() => {
            router.back();
          }}
        >
          <Text>{"< Back"}</Text>
        </button>
        <div className="h-8"></div>

        <div className="flex w-full flex-col rounded-lg border border-black bg-white pb-12">
          <div className="h-16 rounded-t-lg bg-olive-100 sm:h-32"></div>
          <div className="-mt-4 px-4 sm:-mt-8 sm:px-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 sm:gap-12">
                <ProfileImage
                  src={listing?.profile_listing_image?.image.url}
                  alt={`${first_name} ${last_name}`}
                  className="h-24 w-24 sm:h-48 sm:w-48"
                />
                <div className="mt-4 flex flex-col">
                  <Text variant="heading3" mobileVariant="heading4">
                    {first_name} {last_name}
                  </Text>
                  <div className="h-1"></div>
                  <Text variant="body1">{listing?.headline}</Text>
                </div>
              </div>
              {isMyProfile ? (
                <Link href={`/space/${spaceSlug}/account/profile`} passHref>
                  <a>
                    <Button rounded>
                      <BxEdit className="-ml-2 mr-2 h-5 w-5" />
                      Edit profile
                    </Button>
                  </a>
                </Link>
              ) : (
                <div className="flex items-center">
                  <Button
                    rounded
                    className="flex items-center"
                    onClick={() => {
                      if (isLoggedIn) {
                        const dmChatRoomId =
                          profileData?.profile_to_chat_room?.find(
                            (room) =>
                              room.chat_room.profile_to_chat_rooms.length === 2
                          )?.chat_room_id;
                        if (dmChatRoomId) {
                          router.push(
                            `/space/${spaceSlug}/chat/${dmChatRoomId}`
                          );
                        } else {
                          handlers.open();
                        }
                      } else {
                        loginModalHandlers.open();
                      }
                    }}
                    disabled={isMyProfile}
                  >
                    <BxMessageDetail className="-ml-2 mr-2 h-5 w-5" />
                    Message
                  </Button>
                  <ProfilePageDropdown />
                </div>
              )}
            </div>
            <div className="h-16"></div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-8 sm:p-6">
                {listing?.profile_listing_responses.map((response) => {
                  return (
                    <div key={response.id}>
                      <Text
                        variant="heading4"
                        mobileVariant="subheading1"
                        className="text-green-800"
                      >
                        {response.space_listing_question.title}
                      </Text>
                      <div className="h-1"></div>
                      <HtmlDisplay
                        html={response.response_html}
                        className="text-gray-900"
                      />
                    </div>
                  );
                })}
                {/* <div>
                  <Text
                    variant="heading4"
                    mobileVariant="subheading1"
                    className="text-green-800"
                  >
                    {"Let's talk!"}
                  </Text>
                  <div className="h-4"></div>
                  <Button
                    rounded
                    onClick={() => {
                      if (isLoggedIn) {
                        handlers.open();
                      } else {
                        loginModalHandlers.open();
                      }
                    }}
                    disabled={profileId === currentProfile?.id}
                  >
                    Contact {first_name}
                  </Button>
                </div> */}
              </div>
              <div>
                <div className="flex flex-col gap-8 rounded-md border-olive-700 sm:border sm:p-6">
                  {currentSpace?.space_tag_categories.map((category) => {
                    const tags = category.space_tags.filter((tag) =>
                      profileTagIds.has(tag.id)
                    );
                    return (
                      <div key={category.id}>
                        <Text
                          variant="heading4"
                          mobileVariant="subheading1"
                          className="text-green-800"
                        >
                          {category.title}
                        </Text>
                        <div className="h-4"></div>
                        <div className="flex flex-wrap gap-2">
                          {tags.length > 0 ? (
                            tags.map((tag) => {
                              return (
                                <Tag key={tag.id} text={tag.label ?? ""} />
                              );
                            })
                          ) : (
                            <Text
                              variant="body1"
                              className="text-gray-700"
                              italic
                            >
                              No tags
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="h-8"></div>
                <div className="rounded-md border-olive-700 sm:border sm:p-6">
                  <Text
                    variant="heading4"
                    mobileVariant="subheading1"
                    className="text-green-800"
                  >
                    Profiles
                  </Text>
                  <div className="h-4"></div>
                  <Text>{email}</Text>
                  <div className="h-4"></div>

                  <ProfileSocialsDisplay
                    profileListingId={listing?.id ?? ""}
                    email={email}
                  />

                  <div className="flex"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-32"></div>
        {profileId && (
          <MessageModal
            isOpen={open}
            onClose={handlers.close}
            receiverProfileIds={[profileId]}
            onMessageSent={refetchProfileById}
          />
        )}

        <PleaseLogInModal
          isOpen={loginModalOpen}
          onClose={loginModalHandlers.close}
        />
      </SidePadding>
      <SidePadding className="flex h-64 items-center justify-center border-t border-green-900 bg-olive-100">
        <div className="flex h-full w-full items-center justify-center">
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/space/${spaceSlug}`);
            }}
          >
            View more members
          </Button>
        </div>
      </SidePadding>
    </div>
  );
};

ProfilePage.requiredAuthorizations = [];

export default ProfilePage;
