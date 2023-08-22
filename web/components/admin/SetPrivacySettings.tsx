import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import { Button, Text } from "../../components/atomic";
import {
  useUpdateSpaceAttributesMutation,
  useUpdateSpaceMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import {
  PrivacySettings,
  usePrivacySettings,
} from "../../hooks/usePrivacySettings";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { CheckBox } from "../atomic/CheckBox";

export function SetPrivacySettings() {
  const { currentSpace } = useCurrentSpace();

  const { privacySettings } = usePrivacySettings();

  const [settings, setSettings] = useState<PrivacySettings>();
  const { mustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (privacySettings) {
      setSettings(privacySettings);
    }
  }, [privacySettings]);

  const [loading, setLoading] = useState(false);
  const [_, updateSpaceAttributes] = useUpdateSpaceAttributesMutation();

  if (!settings) {
    return null;
  }

  return (
    <div className="">
      {mustSave && (
        <>
          <Text variant="body2" style={{ color: "red" }}>
            You must click {'"Save Changes"'} for your changes to take effect.
          </Text>
        </>
      )}
      <div className="h-4"></div>
      <CheckBox
        label={`Public (visible to anyone who visits ${window.location.origin}/space/${currentSpace?.slug}, not just members in your space)`}
        checked={settings.public}
        onChange={(newVal) => {
          setMustSave(true);
          setSettings({ ...settings, public: newVal });
        }}
      />
      <div className="h-4"></div>

      <CheckBox
        label={`Only allow members with published profiles to view other profiles. (Admins will still be able to view all published profiles)`}
        checked={settings.allowOnlyPublicMembersToViewProfiles}
        onChange={(newVal) => {
          setMustSave(true);
          setSettings({
            ...settings,
            allowOnlyPublicMembersToViewProfiles: newVal,
          });
        }}
      />

      <div className="h-8"></div>
      <Button
        disabled={!mustSave}
        rounded
        onClick={() => {
          if (!currentSpace) {
            toast.error("No space");
            return;
          }
          setLoading(true);
          updateSpaceAttributes({
            changes: settings,
            space_id: currentSpace.id,
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
    </div>
  );
}
