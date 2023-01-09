import { useState, useEffect } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { useUserData } from "../../hooks/useUserData";
import { UserAttributes } from "../../lib/userAttributes";
import settings from "../../pages/settings";
import { Button, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";

export function UserSettings() {
  const { userData, userAttributes, updateUserAttributes } = useUserData();
  const router = useRouter();

  const [settings, setSettings] = useState<UserAttributes>();
  const { localMustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (userAttributes) {
      setSettings(userAttributes);
    }
  }, [userAttributes]);

  const [loading, setLoading] = useState(false);

  return (
    <>
      <Text variant="heading3">
        Global Settings for {userData?.first_name} {userData?.last_name}
      </Text>
      <div className="h-2"></div>
      <Text variant="body1" className="text-gray-700">
        These settings apply across the entire Canopy platform.
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
        disabled={!localMustSave}
        rounded
        onClick={() => {
          if (!settings) return;

          setLoading(true);
          updateUserAttributes(settings)
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
    </>
  );
}
