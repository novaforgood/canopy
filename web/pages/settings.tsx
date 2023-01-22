import { useRouter } from "next/router";

import { UserSettings } from "../components/account-settings/UserSettings";
import { Button, Text } from "../components/atomic";
import { SidePadding } from "../components/layout/SidePadding";
import { Navbar } from "../components/navbar/Navbar";
import { useUserData } from "../hooks/useUserData";
import { CustomPage } from "../types";

const SettingsPage: CustomPage = () => {
  const { userData } = useUserData();
  const router = useRouter();

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

        <UserSettings />
        <div className="h-16"></div>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/delete-account");
          }}
        >
          Delete Account
        </Button>
        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
};

export default SettingsPage;
