import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Button, Text } from "../../components/atomic";
import { useUpdateSpaceMutation } from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { CheckBox } from "../atomic/CheckBox";

type SpaceAttributes = {
  public: boolean;
};

const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
};

export function SetPrivacySettings() {
  const { currentSpace } = useCurrentSpace();

  const [attributes, setAttributes] = useState<SpaceAttributes>();
  const { mustSave, setMustSave } = useSaveChangesState();

  useEffect(() => {
    if (currentSpace) {
      const attrs = { ...DEFAULT_SPACE_ATTRIBUTES, ...currentSpace.attributes };
      setAttributes(attrs);
    }
  }, [currentSpace]);

  const [loading, setLoading] = useState(false);
  const [_, updateSpace] = useUpdateSpaceMutation();

  if (!attributes) {
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
        checked={attributes.public}
        onChange={(newVal) => {
          setMustSave(true);
          setAttributes({ ...attributes, public: newVal });
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
          updateSpace({
            variables: {
              attributes: attributes,
            },
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
