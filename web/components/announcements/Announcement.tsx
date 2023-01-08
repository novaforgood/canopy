import { format } from "date-fns";
import { BxChat, BxMessageDetail } from "../../generated/icons/regular";
import { Button, Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { ProfileImage } from "../ProfileImage";
import { RoundedCard } from "../RoundedCard";
import { Tag } from "../Tag";

export interface AnnouncementProps {
  timeCreated: Date;
  contentHTML: string;
  pinned?: boolean;
  author: {
    first_name: string;
    last_name: string;
    profile_img_url: string;
  };
}

const Announcement = ({ data }: { data: AnnouncementProps }) => {
  const authorName = `${data.author.first_name} ${data.author.last_name}`;
  const dateString = format(data.timeCreated, "MMMM dd, yyyy");
  const timeString = format(data.timeCreated, "h:mm aa");

  return (
    <RoundedCard className="flex flex-col gap-2 ">
      <div className="flex flex-row items-start gap-4 sm:overflow-auto">
        {/* Profile photo */}
        <ProfileImage
          src={data.author.profile_img_url}
          className="h-14 w-14 grow-0"
        />

        {/* Author, Date and Time */}
        <div className="flex grow flex-col">
          <Text variant="subheading1" className="mt-1">
            {authorName}
          </Text>
          <Text variant="body3" className="mt-1 text-gray-800">
            {dateString}
            <span className="ml-4 text-gray-600">{timeString}</span>
          </Text>

          <div className="h-4" />
        </div>

        {/* Pinned tag */}
        {data.pinned && (
          <Tag text={"Pinned"} variant="primary" className="bg-lime-300" />
        )}
      </div>

      {/* Content */}
      <div className="max-w-full sm:ml-2 sm:pl-16">
        <HtmlDisplay
          html={data.contentHTML}
          className="max-w-prose "
        ></HtmlDisplay>
      </div>

      <div className="mt-4 flex flex-row justify-start sm:justify-end">
        <Button
          variant="outline"
          className=" mr-2 ml-2 mb-2 bg-transparent px-3.5 text-body2 text-gray-700"
        >
          <BxMessageDetail className="mr-2 h-6 w-6" />
          Message Admin
        </Button>
      </div>
    </RoundedCard>
  );
};

export default Announcement;
