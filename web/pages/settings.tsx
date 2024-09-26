import React from "react";

import { unlink } from "firebase/auth";
import { useRouter } from "next/router";

import { UserSettings } from "../components/account-settings/UserSettings";
import { Button, Text } from "../components/atomic";
import { ChangeEmailComponent } from "../components/ChangeEmailComponent"; // Adjust the import path as necessary
import { SidePadding } from "../components/layout/SidePadding";
import { Navbar } from "../components/navbar/Navbar";
import { useUserData } from "../hooks/useUserData";
import { getCurrentUser } from "../lib/firebase";
import { CustomPage } from "../types";

const SettingsPage: CustomPage = () => {
  const { userData } = useUserData();
  const router = useRouter();

  console.log(getCurrentUser()?.providerData);

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

        {/* <Button
          onClick={() => {
            const user = getCurrentUser();
            if (user) {
              unlink(user, "password");
            }
          }}
        >
          Test unlink pw
        </Button> */}
        <ChangeEmailComponent />

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
