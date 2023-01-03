import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { AnnouncementProps } from "../../../../components/announcements/Announcement";
import AnnouncementList from "../../../../components/announcements/AnnouncementList";
import AnnouncementModal from "../../../../components/announcements/AnnouncementModal";
import { Button, Text } from "../../../../components/atomic";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import {
  AnnouncementsBySpaceIdQuery,
  Profile_Role_Enum,
  useAnnouncementsBySpaceIdQuery,
} from "../../../../generated/graphql";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { CustomPage } from "../../../../types";

// TODO: add placeholder for if space doesnt exist (or if you aren't logged in)

// Turns query data into a list of more organized objects.
function mapQueryDataToObjects(
  queryData: AnnouncementsBySpaceIdQuery | undefined
) {
  // filter deleted posts
  const filtered = queryData?.announcements.filter((entry) => !entry.deleted);

  // map query data to AnnouncementProps
  return filtered?.map(
    (entry) =>
      ({
        timeCreated: new Date(entry.created_at),
        author: {
          first_name: entry.author_profile.user.first_name,
          last_name: entry.author_profile.user.last_name,
          profile_img_url:
            entry.author_profile.profile_listing?.profile_listing_image?.image
              .url,
        },
        contentHTML: entry.content,
      } as AnnouncementProps)
  );
}

const AnnouncementsPage: CustomPage = () => {
  const { currentSpace } = useCurrentSpace();
  const { currentProfileHasRole } = useCurrentProfile();

  // announcements data
  const [{ data: queryData }, refetchQuery] = useAnnouncementsBySpaceIdQuery({
    variables: {
      space_id: currentSpace?.id ?? "",
    },
  });

  // "Create Announcement" Modal
  const [modalOpen, modalHandlers] = useDisclosure(false);

  return (
    <div className="bg-olive-50">
      {/* The Navbar */}
      <Navbar />

      <SidePadding className="min-h-screen">
        <div className="h-20" />

        {/* Title */}
        <Text variant="heading3" className="text-green-900">
          Community-Wide Announcements
        </Text>
        <div className="h-4" />
        <Text variant="subheading2" className="text-green-900">
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
                Make a new Post
              </Button>
            )}
          </div>

          {/* Announcement List */}
          <div className="grow">
            <AnnouncementList
              announcements={mapQueryDataToObjects(queryData)}
            />
          </div>
        </div>

        <div className="h-20" />
      </SidePadding>

      {/* Modal for Creating an Announcement */}
      <AnnouncementModal
        isOpen={modalOpen}
        closeCallback={modalHandlers.close}
        actionCallback={() => {
          refetchQuery();
          modalHandlers.close();
        }}
      />
    </div>
  );
};

export default AnnouncementsPage;
