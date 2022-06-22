import { Fragment, useEffect, useState } from "react";

import { faker } from "@faker-js/faker";
import { useDisclosure } from "@mantine/hooks";
import { LexRuntime } from "aws-sdk";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { EmailType } from "../../../../common/types";
import { Button, Select, Text, Textarea } from "../../../../components/atomic";
import { SelectAutocomplete } from "../../../../components/atomic/SelectAutocomplete";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { ProfileSocialsDisplay } from "../../../../components/edit-socials-info/ProfileSocialsDisplay";
import { HtmlDisplay } from "../../../../components/HtmlDisplay";
import { ActionModal } from "../../../../components/modals/ActionModal";
import { Navbar } from "../../../../components/Navbar";
import { ProfileImage } from "../../../../components/ProfileImage";
import { SidePadding } from "../../../../components/SidePadding";
import { Tag } from "../../../../components/Tag";
import { useProfileByIdQuery } from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useIsLoggedIn } from "../../../../hooks/useIsLoggedIn";
import { useQueryParam } from "../../../../hooks/useQueryParam";
import { useUserData } from "../../../../hooks/useUserData";
import { apiClient } from "../../../../lib/apiClient";
import { getTimezoneSelectOptions } from "../../../../lib/timezone";
import { CustomPage } from "../../../../types";

const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface PleaseLogInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PleaseLogInModal(props: PleaseLogInModalProps) {
  const { isOpen, onClose } = props;

  const router = useRouter();

  return (
    <ActionModal
      isOpen={isOpen}
      actionText={"Login"}
      onAction={() => {
        router.push(`/login?redirect=${router.asPath}`);
      }}
      secondaryActionText="Cancel"
      onSecondaryAction={onClose}
      onClose={onClose}
    >
      <div className="p-8 w-80">
        <Text>Please log in so we can introduce you.</Text>
      </div>
    </ActionModal>
  );
}

interface IntroduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
}
function IntroduceModal(props: IntroduceModalProps) {
  const { isOpen, onClose, profileId } = props;

  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const [introMsg, setIntroMsg] = useState("");
  const [avail, setAvail] = useState("");

  const [timezone, setTimezone] = useState<string | null>(defaultTz);

  useEffect(() => {
    if (isOpen) {
      setIntroMsg("");
      setAvail("");
      setTimezone(defaultTz);
    }
  }, [isOpen]);

  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "" },
  });

  if (!profileData?.profile_by_pk) {
    return null;
  }

  return (
    <>
      <ActionModal
        isOpen={isOpen}
        actionText={"Send introduction"}
        onClose={onClose}
        onAction={async () => {
          if (!avail) {
            toast.error("Please enter your availability");
            return;
          }

          if (!currentProfile) {
            toast.error("Please login to send an intro");
            return;
          }

          if (!profileId) {
            toast.error("Please select a profile to send an intro");
            return;
          }

          await apiClient
            .post("/api/services/sendEmail", {
              type: EmailType.Connect,
              payload: {
                senderProfileId: currentProfile.id,
                receiverProfileId: profileId,
                introMessage: introMsg,
                availability: avail,
                timezone,
              },
            })
            .then(() => {
              toast.success("Intro sent!");
              onClose();
            })
            .catch((err) => {
              toast.error(err.message);
            });
        }}
        actionDisabled={!avail || !timezone}
        secondaryActionText={"Cancel"}
        onSecondaryAction={onClose}
      >
        <div className="pt-8 px-16">
          <div className="w-96 flex flex-col items-center ">
            <Text variant="heading4">{`Let's introduce you to ${profileData.profile_by_pk.user.first_name}`}</Text>
            <div className="h-4"></div>
            <Text className="text-gray-600 text-center" variant="body2">
              {"We'll"} send an email to{" "}
              {profileData.profile_by_pk.user.first_name}, as well as you at{" "}
              <Text variant="body2" className="text-black">
                {userData?.email}
              </Text>
              .
            </Text>
            <div className="h-8"></div>

            <div className="flex flex-col w-96 gap-8">
              <div className="w-full flex flex-col">
                <Text className="text-gray-600 mb-2">
                  Optional intro message
                </Text>
                <Textarea
                  minRows={4}
                  value={introMsg}
                  onValueChange={setIntroMsg}
                  placeholder="Example: Hi, I’m Billy! I am a Student at Taylor Middle School. Would you be free for a 30 minute chat about dinosaurs? Thank you for your consideration. "
                />
              </div>
              <div className="w-full flex flex-col">
                <Text className="text-gray-600 mb-2">
                  Please add your general availability*
                </Text>
                <Textarea
                  value={avail}
                  onValueChange={setAvail}
                  placeholder="Example: Monday and Tuesday nights after 7pm. All day Saturday and Sunday."
                ></Textarea>
              </div>
              <div className="w-full flex flex-col items-start">
                <Text className="text-gray-600 mb-2">
                  Please select your timezone*
                </Text>
                <SelectAutocomplete
                  options={getTimezoneSelectOptions()}
                  value={timezone}
                  onSelect={setTimezone}
                  className="w-96"
                />
              </div>
            </div>
          </div>
          <div className="h-16"></div>
        </div>
      </ActionModal>
    </>
  );
}
const SpaceHomepage: CustomPage = () => {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();
  const isLoggedIn = useIsLoggedIn();

  const [open, handlers] = useDisclosure(false);
  const [loginModalOpen, loginModalHandlers] = useDisclosure(false);

  const profileId = useQueryParam("profileId", "string");
  const [{ data: profileData }] = useProfileByIdQuery({
    variables: { profile_id: profileId ?? "" },
  });

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!profileData?.profile_by_pk?.profile_listing) {
    return <div>404 - Profile listing not found</div>;
  }

  const listing = profileData.profile_by_pk.profile_listing;
  const { first_name, last_name, email } = profileData.profile_by_pk.user;

  const profileTagIds = new Set(
    listing.profile_listing_to_space_tags.map((item) => item.space_tag_id)
  );

  return (
    <div>
      <SidePadding>
        <Navbar />
        <div className="h-16"></div>
        <Breadcrumbs />
        <div className="h-8"></div>

        <div className="border border-black rounded-lg w-full flex flex-col pb-12">
          <div className="h-16 sm:h-32 bg-gray-100 rounded-t-lg"></div>
          <div className="px-4 -mt-4 sm:px-20 sm:-mt-8">
            <div className="flex items-center gap-6 sm:gap-12">
              <ProfileImage
                src={listing.profile_listing_image?.image.url}
                alt={`${first_name} ${last_name}`}
                className="w-24 h-24 sm:h-48 sm:w-48"
              />
              <div className="flex flex-col mt-4">
                <Text variant="heading3" mobileVariant="heading4">
                  {first_name} {last_name}
                </Text>
                <div className="h-1"></div>
                <Text variant="body1">{listing.headline}</Text>
              </div>
            </div>
            <div className="h-16"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-8 p-4">
                {listing.profile_listing_responses.map((response) => {
                  return (
                    <div key={response.id}>
                      <Text variant="heading4" mobileVariant="subheading1">
                        {response.space_listing_question.title}
                      </Text>
                      <div className="h-1"></div>
                      <HtmlDisplay html={response.response_html} />
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="bg-gray-50 p-4 rounded-md">
                  {currentSpace.space_tag_categories.map((category) => {
                    return (
                      <div key={category.id}>
                        <Text variant="heading4" mobileVariant="subheading1">
                          {category.title}
                        </Text>
                        <div className="h-2"></div>
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
                <div className="bg-gray-50 p-4 rounded-md">
                  <Text variant="heading4" mobileVariant="subheading1">
                    Contact
                  </Text>
                  <div className="h-4"></div>
                  <Text>{profileData.profile_by_pk.user.email}</Text>
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
                    Introduce me
                  </Button>
                  <div className="h-8"></div>
                  <ProfileSocialsDisplay
                    profileListingId={listing.id}
                    email={email}
                  />

                  <div className="flex"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-32"></div>
        <IntroduceModal
          isOpen={open}
          onClose={handlers.close}
          profileId={profileId}
        />
        <PleaseLogInModal
          isOpen={loginModalOpen}
          onClose={loginModalHandlers.close}
        />
      </SidePadding>
    </div>
  );
};

SpaceHomepage.requiredAuthorizations = [];

export default SpaceHomepage;
