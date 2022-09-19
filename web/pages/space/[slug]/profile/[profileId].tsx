import { Fragment } from "react";

import { faker } from "@faker-js/faker";
import { useDisclosure } from "@mantine/hooks";
import { LexRuntime } from "aws-sdk";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button, Select, Text } from "../../../../components/atomic";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { ProfileSocialsDisplay } from "../../../../components/edit-socials-info/ProfileSocialsDisplay";
import { HtmlDisplay } from "../../../../components/HtmlDisplay";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { Tag } from "../../../../components/Tag";
import { useProfileByIdQuery } from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { CustomPage } from "../../../../types";
import { BxMessageDetail } from "../../../../generated/icons/regular";
import { IntroduceModal } from "../../../../components/profile-page/IntroduceModal";
import { PleaseLogInModal } from "../../../../components/PleaseLogInModal";
import { MessageModal } from "../../../../components/profile-page/MessageModal";

const SpaceHomepage: CustomPage = () => {
  const router = useRouter();

  const { currentSpace, fetchingCurrentSpace } = useCurrentSpace();
  const spaceSlug = useQueryParam("slug", "string");
  const { currentProfile } = useCurrentProfile();
  const isLoggedIn = useIsLoggedIn();

  const [open, handlers] = useDisclosure(false);
  const [loginModalOpen, loginModalHandlers] = useDisclosure(false);

  const profileId = useQueryParam("profileId", "string");
  const [
    { data: profileData, fetching: fetchingProfileData },
    refetchProfileById,
  ] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "" },
  });

  if (!currentSpace && !fetchingCurrentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!profileData?.profile_by_pk?.profile_listing && !fetchingProfileData) {
    return <div>404 - Profile listing not found</div>;
  }

  const listing = profileData?.profile_by_pk?.profile_listing;
  const { first_name, last_name, email } =
    profileData?.profile_by_pk?.user ?? {};

  const profileTagIds = new Set(
    listing?.profile_listing_to_space_tags.map((item) => item.space_tag_id)
  );

  return (
    <div>
      <div className="bg-gray-100">
        <Navbar />
      </div>
      <SidePadding className="bg-gray-100">
        <div className="h-16"></div>
        <Link href={`/space/${spaceSlug}`}>{"< Members"}</Link>
        <div className="h-8"></div>

        <div className="flex w-full flex-col rounded-lg border border-black bg-white pb-12">
          <div className="h-16 rounded-t-lg bg-olive-100 sm:h-32"></div>
          <div className="-mt-4 px-4 sm:-mt-8 sm:px-20">
            <div className="flex items-center justify-between">
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
              <Button
                rounded
                className="flex items-center"
                onClick={() => {
                  if (isLoggedIn) {
                    const chatRoomId =
                      profileData?.profile_to_chat_room[0]?.chat_room_id;
                    if (chatRoomId) {
                      router.push(`/space/${spaceSlug}/chat/${chatRoomId}`);
                    } else {
                      handlers.open();
                    }
                  } else {
                    loginModalHandlers.open();
                  }
                }}
                disabled={profileId === currentProfile?.id}
              >
                <BxMessageDetail className="-ml-2 mr-2 h-5 w-5" />
                Message
              </Button>
            </div>
            <div className="h-16"></div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-8 p-6">
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
                <div className="flex flex-col gap-8 rounded-md border border-olive-700 p-6">
                  {currentSpace?.space_tag_categories.map((category) => {
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
                          {category.space_tags.map((tag) => {
                            if (!profileTagIds.has(tag.id)) {
                              return null;
                            } else {
                              return (
                                <Tag key={tag.id} text={tag.label ?? ""} />
                              );
                            }
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="h-8"></div>
                <div className="rounded-md border border-olive-700 p-6">
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
        <MessageModal
          isOpen={open}
          onClose={handlers.close}
          profileId={profileId}
          onMessageSent={refetchProfileById}
        />
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

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
