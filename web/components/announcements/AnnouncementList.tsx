import Announcement, { AnnouncementProps } from "./Announcement";

interface AnnouncementListProps {
  announcements: AnnouncementProps[] | undefined;
}

const AnnouncementList = ({ announcements }: AnnouncementListProps) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {announcements?.map((entry) => (
        // oops
        <Announcement data={entry} key={entry.timeCreated.toISOString()} />
      ))}
    </div>
  );
};

export default AnnouncementList;
