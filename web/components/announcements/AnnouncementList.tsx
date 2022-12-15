import Announcement, { AnnouncementProps } from "./Announcement";

interface AnnouncementListProps {
  announcements: AnnouncementProps[] | undefined;
}

const AnnouncementList = ({ announcements }: AnnouncementListProps) => {
  return (
    <div className="flex flex-col gap-6">
      {announcements?.map((entry) => (
        <Announcement data={entry} />
      ))}
    </div>
  );
};

export default AnnouncementList;
