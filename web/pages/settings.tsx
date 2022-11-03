import { ReactNode, useEffect, useState } from "react";

import { useSetState } from "@mantine/hooks";
import { getAdditionalUserInfo } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button, Text } from "../components/atomic";
import { CheckBox } from "../components/atomic/CheckBox";
import { Input } from "../components/atomic/Input";
import { TextInput } from "../components/inputs/TextInput";
import { ImageSidebar } from "../components/layout/ImageSidebar";
import { SidePadding } from "../components/layout/SidePadding";
import { TwoThirdsPageLayout } from "../components/layout/TwoThirdsPageLayout";
import { Navbar } from "../components/Navbar";
import { useUserQuery } from "../generated/graphql";
import { BxlGoogle } from "../generated/icons/logos";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useRedirectUsingQueryParam } from "../hooks/useRedirectUsingQueryParam";
import { useSaveChangesState } from "../hooks/useSaveChangesState";
import { useUserAttributes } from "../hooks/useUserAttributes";
import { useUserData } from "../hooks/useUserData";
import { queryToString } from "../lib";
import { handleError } from "../lib/error";
import { signOut } from "../lib/firebase";
import { UserAttributes } from "../lib/userAttributes";
import { CustomPage } from "../types";

const SettingsPage: CustomPage = () => {
  const { userData } = useUserData();
  const router = useRouter();

  const { userAttributes, updateUserAttributes } = useUserAttributes();
  const [settings, setSettings] = useState<UserAttributes>();
  const { mustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (userAttributes) {
      setSettings(userAttributes);
    }
  }, [userAttributes]);

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

        <Text variant="heading2">
          User Settings for {userData?.first_name} {userData?.last_name}
        </Text>

        <div className="h-12"></div>
        <CheckBox
          label={`Disable email notifications`}
          checked={settings?.disableEmailNotifications ?? false}
          onChange={(newVal) => {
            setMustSave(true);
            setSettings((prev) => ({
              ...prev,
              disableEmailNotifications: newVal,
            }));
          }}
        />
        <div className="h-8"></div>
        <Button
          disabled={!mustSave}
          rounded
          onClick={() => {
            if (!userData) return;

            setLoading(true);
            updateUserAttributes({
              changes: settings,
              user_id: userData.id,
            })
              .then((res) => {
                if (res.error) {
                  throw new Error(res.error.message);
                } else {
                  setMustSave(false);
                  toast.success("Saved settings");
                }
              })
              .catch((err) => {
                toast.error(err.message);
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          loading={loading}
        >
          Save changes
        </Button>

        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
};

export default SettingsPage;
