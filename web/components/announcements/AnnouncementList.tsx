import { useEffect, useMemo } from "react";

import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";

import {
  useUpdateLatestReadAnnouncementMutation,
  useAnnouncementsBySpaceIdQuery,
  Profile_Role_Enum,
  AnnouncementsBySpaceIdQuery,
} from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useQueryParam } from "../../hooks/useQueryParam";
import {
  getFirstNameOfUser,
  getFullNameOfUser,
  getLastNameOfUser,
} from "../../lib/user";
import { Button, Text } from "../atomic";

import { Announcement, AnnouncementDisplay } from "./AnnouncementDisplay";
import { AnnouncementModal } from "./AnnouncementModal";

// Turns query data into a list of more organized objects.
function mapQueryDataToObjects(
  queryData: AnnouncementsBySpaceIdQuery | undefined
) {
  // filter deleted posts
  const filtered = queryData?.announcement.filter((entry) => !entry.deleted);

  // map query data to AnnouncementProps
  return filtered?.map(
    (entry) =>
      ({
        id: entry.id,
        timeCreated: new Date(entry.created_at),
        author: {
          profileId: entry.author_profile.id,
          fullName: getFullNameOfUser(entry.author_profile.user),
          firstName: getFirstNameOfUser(entry.author_profile.user),
          lastName: getLastNameOfUser(entry.author_profile.user),
          profileImgUrl:
            entry.author_profile.profile_listing?.profile_listing_image?.image
              .url,
        },
        contentHTML: entry.content,
      } as Announcement)
  );
}

const AnnouncementList = () => {
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole, currentProfile, refetchCurrentProfile } =
    useCurrentProfile();
  const [_, updateReadAnnouncement] = useUpdateLatestReadAnnouncementMutation();

  // announcements data
  const [{ data: queryData }, refetchAnnouncements] =
    useAnnouncementsBySpaceIdQuery({
      variables: {
        space_id: currentSpace?.id ?? "",
      },
    });

  const announcements = useMemo(() => {
    return mapQueryDataToObjects(queryData);
  }, [queryData]);

  // update read announcements
  useEffect(() => {
    if (currentProfile && queryData?.announcement) {
      const latestAnnouncementId =
        queryData.announcement.length > 0 ? queryData.announcement[0].id : null;

      // update if last_read_announcement_id is null or less than the latest announcement
      const shouldUpdate =
        !currentProfile.last_read_announcement_id ||
        (latestAnnouncementId &&
          currentProfile.last_read_announcement_id < latestAnnouncementId);

      if (shouldUpdate) {
        updateReadAnnouncement({
          id: currentProfile.id,
          last_read_announcement_id: latestAnnouncementId,
        });
        refetchCurrentProfile();
      }
    }
  }, [
    currentProfile,
    queryData,
    refetchCurrentProfile,
    updateReadAnnouncement,
  ]);

  // "Create Announcement" Modal
  const [modalOpen, modalHandlers] = useDisclosure(false);

  const router = useRouter();
  const template = useQueryParam("template", "string");
  const spaceSlug = useQueryParam("slug", "string");
  useEffect(() => {
    if (template === "chat-intros" && !modalOpen) {
      modalHandlers.open();
      router.replace(`/space/${spaceSlug}/announcements`, undefined, {
        shallow: true,
      });
    }
  }, [template, modalHandlers, router, modalOpen, spaceSlug]);

  return (
    <div>
      {/* Title */}
      <Text variant="heading3" className="text-green-900">
        Announcements
      </Text>
      <div className="h-4" />
      <Text variant="body1" className="text-green-900">
        All messages from {currentSpace?.name} admins will be posted here.
      </Text>

      <div className="h-12" />

      <div className="flex w-full flex-col gap-8 lg:flex-row-reverse lg:items-start">
        {/* Make a new Announcement Post Button */}
        <div className="min-h-1 w-60 grow-0">
          {currentProfileHasRole(Profile_Role_Enum.Admin) && (
            <Button
              variant="primary"
              className="grow-0"
              onClick={modalHandlers.open}
            >
              Add Post (Admins Only)
            </Button>
          )}
        </div>

        {/* Announcement List */}
        <div className="grow">
          <div className="flex flex-col gap-4 sm:gap-6">
            {announcements?.map((entry) => (
              <AnnouncementDisplay
                onDeleted={() => refetchAnnouncements()}
                data={entry}
                key={entry.timeCreated.toISOString()}
              />
            ))}
          </div>
        </div>

        {/* Modal for Creating an Announcement */}
        <AnnouncementModal
          isOpen={modalOpen}
          closeCallback={modalHandlers.close}
          actionCallback={() => {
            refetchAnnouncements();
            modalHandlers.close();
          }}
        />
      </div>
      <div className="h-20" />
    </div>
  );
};

export default AnnouncementList;
