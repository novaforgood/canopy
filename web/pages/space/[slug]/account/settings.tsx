import { useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { ProfileSettings } from "../../../../components/account-settings/ProfileSettings";
import { UserSettings } from "../../../../components/account-settings/UserSettings";
import { Button, Text } from "../../../../components/atomic";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useUserData } from "../../../../hooks/useUserData";
import { apiClient } from "../../../../lib/apiClient";
import { CustomPage } from "../../../../types";

const SettingsPage: CustomPage = () => {
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-gray-50">
      <Navbar />
      <SidePadding className="min-h-screen">
        <div className="h-16"></div>
        <button
          className="hover:underline"
          onClick={() => {
            router.back();
          }}
        >
          <Text>{"< Back"}</Text>
        </button>

        <div className="h-8"></div>

        <ProfileSettings />
        <div className="h-20"></div>
        <UserSettings />
        <div className="h-20"></div>
        <Text variant="heading3">Danger Zone</Text>
        <div className="h-4"></div>
        <Button
          variant="outline"
          onClick={() => {
            if (!currentProfile) {
              toast.error("You must be logged in to delete your account.");
              return;
            }

            const response = window.prompt(
              "Are you sure you want to leave? Your profile data will be deleted. Other content, including your sent messages and announcements, will be unlinked from your account. This action is irreversible. To rejoin the space, you will need another invite link. Type 'DELETE' to confirm."
            );

            if (response !== "DELETE") {
              toast.error("You must type 'DELETE' to confirm.");
              return;
            }

            toast.promise(
              apiClient.post("/api/account/deleteProfile", {
                profileId: currentProfile.id,
              }),
              {
                loading: "Deleting profile...",
                success: () => {
                  router.push("/");
                  return "Profile deleted successfully!";
                },
                error: (err) => {
                  console.error(err);
                  return `Error deleting profile: ${err.message}`;
                },
              }
            );
          }}
        >
          Leave space (Delete profile)
        </Button>

        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
};

export default SettingsPage;
