import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import { Button, Input, Text } from "../../components/atomic";
import {
  useUpdateSpaceAttributesMutation,
  useUpdateSpaceMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { useSpaceAttributes } from "../../hooks/useSpaceAttributes";
import { SpaceAttributes } from "../../lib/spaceAttributes";
import { CheckBox } from "../atomic/CheckBox";
import { TextInput } from "../inputs/TextInput";

export function SetPrivacySettings() {
  const { currentSpace } = useCurrentSpace();

  const { attributes } = useSpaceAttributes();

  const [attributesState, setAttributesState] = useState<SpaceAttributes>();
  const { mustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (attributes) {
      setAttributesState(attributes);
    }
  }, [attributes]);

  const [loading, setLoading] = useState(false);
  const [_, updateSpaceAttributes] = useUpdateSpaceAttributesMutation();

  if (!attributesState) {
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
        checked={attributesState.public}
        onChange={(e) => {
          const newVal = e.target?.checked ?? false;

          setMustSave(true);
          setAttributesState({ ...attributesState, public: newVal });
        }}
      />
      <div className="h-4"></div>

      <CheckBox
        label={`Only allow members with published profiles to view other profiles. (Admins will still be able to view all published profiles)`}
        checked={attributesState.allowOnlyPublicMembersToViewProfiles}
        onChange={(e) => {
          const newVal = e.target?.checked ?? false;
          setMustSave(true);
          setAttributesState({
            ...attributesState,
            allowOnlyPublicMembersToViewProfiles: newVal,
          });
        }}
      />

      <div className="h-4"></div>
      <CheckBox
        label={`Opt new users in to matches by default (when they join the space)`}
        checked={attributesState.optUsersInToMatchesByDefault}
        onChange={(e) => {
          const newVal = e.target?.checked ?? false;

          setMustSave(true);
          setAttributesState({
            ...attributesState,
            optUsersInToMatchesByDefault: newVal,
          });
        }}
      />

      <div className="h-12"></div>
      <TextInput
        label="Comma-separated allowed domains to join space. Empty = allow all domains"
        placeholder="example.com,example.org"
        value={attributesState.domainWhitelists?.join(",") ?? ""}
        onChange={(e) => {
          const newVal = e.target.value;

          setMustSave(true);
          setAttributesState({
            ...attributesState,
            domainWhitelists: newVal
              ? newVal.split(",").map((x) => x.trim())
              : null,
          });
        }}
      />

      <div className="h-4"></div>
      <TextInput
        label="Community guidelines URL (users must agree to guidelines before publishing profile)"
        value={attributesState.communityGuidelinesUrl || ""}
        onChange={(e) => {
          const newVal = e.target.value;
          setMustSave(true);
          setAttributesState({
            ...attributesState,
            communityGuidelinesUrl: newVal || null,
          });
        }}
      />

      <div className="h-8"></div>
      {/* <pre>{JSON.stringify(settings, null, 2)}</pre> */}
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
            changes: attributesState,
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
