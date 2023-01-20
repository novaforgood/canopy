import { useCallback } from "react";

import { format } from "date-fns";
import toast from "react-hot-toast";

import { useUpdateAnnouncementMutation } from "../../generated/graphql";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { Text } from "../atomic";
import { DeleteButton } from "../common/DeleteButton";
import { ProfileImage } from "../common/ProfileImage";
import { RoundedCard } from "../common/RoundedCard";
import { Tag } from "../common/Tag";
import { HtmlDisplay } from "../HtmlDisplay";

export interface Announcement {
  id: number;
  timeCreated: Date;
  contentHTML: string;
  pinned?: boolean;
  author: {
    profileId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profileImgUrl: string;
  };
}

interface AnnouncementDisplayProps {
  data: Announcement;
  onDeleted?: () => void;
}

export const AnnouncementDisplay = (props: AnnouncementDisplayProps) => {
  const { data, onDeleted } = props;

  const announcementId = data.id;
  const authorName = `${data.author.firstName} ${data.author.lastName}`;
  const dateString = format(data.timeCreated, "MMMM dd, yyyy");
  const timeString = format(data.timeCreated, "h:mm aa");

  const { currentProfile } = useCurrentProfile();

  const canDelete = currentProfile?.id === data.author.profileId;

  const [, updateAnouncement] = useUpdateAnnouncementMutation();
  const promptDeleteAnnouncement = useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to delete this announcement? Note that emails sent to members cannot be recalled."
      )
    ) {
      return;
    }
    updateAnouncement({
      announcement_id: announcementId,
      changes: {
        deleted: true,
      },
    })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        }

        toast.success("Announcement deleted");
        onDeleted?.();
      })
      .catch((err) => {
        toast.error("Error deleting announcement:", err.message);
      });
  }, [announcementId, onDeleted, updateAnouncement]);

  return (
    <RoundedCard className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4 sm:overflow-auto">
        {/* Profile photo */}
        <ProfileImage
          src={data.author.profileImgUrl}
          className="h-12 w-12 grow-0"
        />

        {/* Author, Date and Time */}
        <div className="flex grow flex-col">
          <Text variant="body1" className="">
            {authorName}
          </Text>
          <Text variant="body3" className="text-gray-800">
            {dateString}
            <span className="ml-4 text-gray-600">{timeString}</span>
          </Text>
        </div>

        {/* Pinned tag */}
        {data.pinned && (
          <Tag text={"Pinned"} variant="primary" className="bg-lime-300" />
        )}

        {canDelete && (
          <DeleteButton onClick={promptDeleteAnnouncement} variant="outline" />
        )}
      </div>

      {/* Content */}
      <div className="max-w-full sm:pl-16">
        <HtmlDisplay
          html={data.contentHTML}
          className="max-w-prose "
        ></HtmlDisplay>
      </div>

      {/* <div className="mt-4 flex flex-row justify-start sm:justify-end">
        <Button
          size="small"
          variant="outline"
          className=" mr-2 ml-2 mb-2 bg-transparent px-3.5 text-body2 text-gray-700"
        >
          <BxMessageDetail className="-ml-1 mr-1 h-4 w-4" />
          Message Poster
        </Button>
      </div> */}
    </RoundedCard>
  );
};
