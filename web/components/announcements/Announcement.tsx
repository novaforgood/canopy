import { format } from "date-fns";
import { Text } from "../atomic";
import { HtmlDisplay } from "../HtmlDisplay";
import { ProfileImage } from "../ProfileImage";
import { RoundedCard } from "../RoundedCard";

export interface AnnouncementProps {
  timeCreated: Date;
  contentHTML: string;
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
    <RoundedCard className="flex flex-row items-start gap-4">
      {/* Left side: Profile photo */}
      <ProfileImage
        src={data.author.profile_img_url}
        className="h-14 w-14 grow-0"
      />

      {/* Right side: Announcement Content */}
      <div className="flex grow flex-col">
        {/* Author and Date/Time Posted */}
        <div className="flex flex-col">
          <Text variant="subheading1" className="mt-1">
            {authorName}
          </Text>
          <Text variant="body2" italic className="mt-1 text-gray-500">
            {dateString}
            <span className="ml-2">{timeString}</span>
          </Text>
        </div>

        <div className="h-4" />

        {/* Content */}
        <HtmlDisplay html={data.contentHTML}></HtmlDisplay>
      </div>
    </RoundedCard>
  );
};

export default Announcement;
