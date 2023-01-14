import AnnouncementList from "../../../../components/announcements/AnnouncementList";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { CustomPage } from "../../../../types";

// TODO: add placeholder for if space doesnt exist (or if you aren't logged in)

const AnnouncementsPage: CustomPage = () => {
  return (
    <div className="bg-olive-50">
      {/* The Navbar */}
      <Navbar />

      <SidePadding className="min-h-screen">
        <div className="h-20" />

        <AnnouncementList />
      </SidePadding>
    </div>
  );
};

export default AnnouncementsPage;
