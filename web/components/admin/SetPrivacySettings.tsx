import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Button, Text } from "../../components/atomic";
import { useUpdateSpaceMutation } from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";

function CheckBox(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { label, checked, onChange } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="form-checkbox h-6 w-6"
      />
      <Text variant="body1">{label}</Text>
    </div>
  );
}

type SpaceAttributes = {
  public: boolean;
};

const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
};

export function SetPrivacySettings() {
  const { currentSpace } = useCurrentSpace();

  const [attributes, setAttributes] = useState<SpaceAttributes>();
  const [edited, setEdited] = useState(false);

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
      <Button
        disabled={!edited}
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
            .then(() => {
              setEdited(false);
              toast.success("Saved settings");
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        loading={loading}
      >
        Save changes
      </Button>
      <div className="h-8"></div>
      <CheckBox
        label={`Public (visible to anyone who visits ${window.location.origin}/space/${currentSpace?.slug}, not just members in your space)`}
        checked={attributes.public}
        onChange={(newVal) => {
          setEdited(true);
          setAttributes({ ...attributes, public: newVal });
        }}
      />
    </div>
  );
}
