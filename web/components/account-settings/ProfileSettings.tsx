import { useState, useEffect } from "react";

import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { useUserData } from "../../hooks/useUserData";
import { ProfileAttributes } from "../../lib/profileAttributes";
import { Button, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";

export function ProfileSettings() {
  const { profileAttributes, updateProfileAttributes } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();

  const { userData } = useUserData();
  const [settings, setSettings] = useState<ProfileAttributes>();
  const { localMustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (profileAttributes) {
      setSettings(profileAttributes);
    }
  }, [profileAttributes]);

  const [loading, setLoading] = useState(false);

  return (
    <>
      <Text variant="heading3">Settings for {currentSpace?.name}</Text>
      <div className="h-2"></div>
      <Text variant="body1" className="text-gray-700">
        These settings apply in {currentSpace?.name}, the space you are
        currently in.
      </Text>

      <div className="h-12"></div>
      <CheckBox
        label={`Opt in to matching (admins can periodically match you with other members in a group chat)`}
        checked={settings?.enableChatIntros ?? false}
        onChange={(newVal) => {
          setMustSave(true);
          setSettings((prev) => ({
            ...prev,
            enableChatIntros: newVal,
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
          updateProfileAttributes(settings)
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
