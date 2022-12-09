import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { ProfileSettings } from "../../../../components/account-settings/ProfileSettings";
import { UserSettings } from "../../../../components/account-settings/UserSettings";
import { Button, Text } from "../../../../components/atomic";
import { CheckBox } from "../../../../components/atomic/CheckBox";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { useSaveChangesState } from "../../../../hooks/useSaveChangesState";
import { useUserData } from "../../../../hooks/useUserData";
import { UserAttributes } from "../../../../lib/userAttributes";
import { CustomPage } from "../../../../types";

const SettingsPage: CustomPage = () => {
  const { userData } = useUserData();
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

        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
};

export default SettingsPage;
