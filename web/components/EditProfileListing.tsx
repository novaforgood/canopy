import { useDisclosure } from "@mantine/hooks";

import { Profile_Role_Enum, useProfileImageQuery } from "../generated/graphql";
import { BxMessageDetail } from "../generated/icons/regular";
import { BxsPencil } from "../generated/icons/solid";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { useUserData } from "../hooks/useUserData";

import { Button, Text } from "./atomic";
import { EditButton } from "./common/EditButton";
import { ProfileImage } from "./common/ProfileImage";
import { EditHeadline } from "./edit-profile/EditHeadline";
import { EditName } from "./edit-profile/EditName";
import { EditProfileImageModal } from "./edit-profile/EditProfileImageModal";
import { EditProfileTags } from "./edit-profile/EditProfileTags";
import { EditResponse } from "./edit-profile/EditResponse";
import { ProfileSocialsDisplay } from "./edit-socials-info/ProfileSocialsDisplay";
import { ProfileSocialsModal } from "./edit-socials-info/ProfileSocialsModal";
import PublishedToggleSwitch from "./PublishedToggleSwitch";

function EditProfileImage() {
  const { currentProfile } = useCurrentProfile();

  const [{ data: profileImageData }] = useProfileImageQuery({
    variables: { profile_id: currentProfile?.id ?? "" },
  });

  const [opened, handlers] = useDisclosure(false);

  const profileImageUrl =
    profileImageData?.profile_listing_image[0]?.image.url ?? null;

  return (
    <>
      <div className="relative h-24 w-24 shrink-0 rounded-full sm:h-40 sm:w-40">
        <ProfileImage className="h-full w-full" src={profileImageUrl} />
        <button
          onClick={handlers.open}
          className="absolute top-0 left-0 flex h-full w-full items-center rounded-full 
          bg-black/50 p-2 text-center text-white/80 opacity-0 transition hover:opacity-100"
        >
          <Text>Change Profile Image</Text>
        </button>
      </div>
      <EditProfileImageModal isOpen={opened} onClose={handlers.close} />
    </>
  );
}
interface EditProfileListingProps {
  showPublishedToggle?: boolean;
}
export function EditProfileListing(props: EditProfileListingProps) {
  const { showPublishedToggle = true } = props;

  const { currentProfile, currentProfileHasRole } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();
  const { userData } = useUserData();

  const [socialsOpened, socialsHandlers] = useDisclosure(false);

  if (!currentProfileHasRole(Profile_Role_Enum.MemberWhoCanList)) {
    return <div>You do not have profile listing permissions.</div>;
  }
  if (!currentProfile || !currentSpace) {
    return <div>Either profile or space is null</div>;
  }

  const { first_name, last_name, email, id } = currentProfile.user;

  return (
    <div className="">
      {showPublishedToggle && (
        <PublishedToggleSwitch
          profileListingId={currentProfile.profile_listing?.id ?? ""}
        />
      )}
      <div className="h-4"></div>
      <div className="flex w-full max-w-3xl flex-col rounded-lg border border-black bg-white pb-12">
        <div className="h-20 rounded-t-lg bg-gray-100"></div>
        <div className="-mt-4 px-4 sm:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 sm:gap-12">
              <EditProfileImage />
              <div className="mt-4 flex flex-col">
                <div className="flex">
                  <Text variant="heading4">
                    {first_name} {last_name}
                  </Text>
                  <EditName />
                </div>
                <div className="h-1"></div>
                <EditHeadline />
              </div>
            </div>
            <Button rounded className="flex items-center" disabled={true}>
              <BxMessageDetail className="-ml-2 mr-2 h-5 w-5" />
              Message
            </Button>
          </div>
          <div className="h-16"></div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-12 pt-4">
              {currentSpace.space_listing_questions
                .filter((item) => item.deleted === false)
                .map((question) => {
                  return <EditResponse key={question.id} question={question} />;
                })}
            </div>
            <div>
              {currentSpace.space_tag_categories.length > 0 && (
                <>
                  <div className="flex flex-col items-start gap-12 rounded-md bg-gray-50 p-4">
                    {currentSpace.space_tag_categories
                      .filter((item) => item.deleted === false)
                      .map((category) => {
                        return (
                          <EditProfileTags
                            key={category.id}
                            tagCategoryId={category.id}
                            profileListingId={
                              currentProfile.profile_listing?.id ?? ""
                            }
                          />
                        );
                      })}
                  </div>
                  <div className="h-8"></div>
                </>
              )}

              <div className="flex flex-col items-start rounded-md bg-gray-50 p-4">
                <Text variant="subheading1">
                  Contact
                  <EditButton
                    className="mb-1 ml-1"
                    onClick={socialsHandlers.open}
                  />
                </Text>
                <div className="h-4"></div>
                <Text>{userData?.email}</Text>
                <div className="h-4"></div>
                <ProfileSocialsDisplay
                  profileListingId={currentProfile.profile_listing?.id ?? ""}
                  email={userData?.email}
                />
                <ProfileSocialsModal
                  isOpen={socialsOpened}
                  onClose={socialsHandlers.close}
                />

                <div className="flex"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
