import { useEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";

import { EditProfileFormat } from "../../../components/admin/EditProfileFormat";
import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { Button, Text } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { EditProfileListing } from "../../../components/EditProfileListing";
import { HtmlDisplay } from "../../../components/HtmlDisplay";
import { ImageUploader } from "../../../components/ImageUploader";
import { SimpleRichTextInput } from "../../../components/inputs/SimpleRichTextInput";
import { TextInput } from "../../../components/inputs/TextInput";
import { Navbar } from "../../../components/Navbar";
import { SidePadding } from "../../../components/SidePadding";
import { SpaceCoverPhoto } from "../../../components/SpaceCoverPhoto";
import { useUpdateSpaceMutation } from "../../../generated/graphql";
import {
  BxFemaleSign,
  BxLink,
  BxQuestionMark,
  BxRightArrow,
  BxRightArrowAlt,
} from "../../../generated/icons/regular";
import {
  BxsCloudUpload,
  BxsCog,
  BxsReport,
} from "../../../generated/icons/solid";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { uploadImage } from "../../../lib/image";

function RoundedCard(props: { children: React.ReactNode; className?: string }) {
  const { children, className } = props;

  const styles = classNames({
    "rounded-md border border-gray-300 p-6": true,
    [`${className}`]: true,
  });
  return <div className={styles}>{children}</div>;
}

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

function SetPrivacySettings() {
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

function EditHomepage() {
  const { currentSpace } = useCurrentSpace();

  const [spaceName, setSpaceName] = useState("");
  const [spaceDescriptionHtml, setSpaceDescriptionHtml] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (currentSpace) {
      setSpaceName(currentSpace.name);
      setImageSrc(currentSpace.space_cover_image?.image.url ?? null);
    }
  }, [currentSpace]);

  const editor = useRef<AvatarEditor | null>(null);

  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_, updateSpace] = useUpdateSpaceMutation();

  return (
    <div className="flex flex-col items-start">
      <Button
        disabled={!edited}
        rounded
        onClick={async () => {
          if (!currentSpace) {
            toast.error("No space");
            return;
          }
          setLoading(true);

          const imageData =
            editor.current?.getImageScaledToCanvas().toDataURL() ?? null;

          let image = null;
          if (imageData) {
            const res = await uploadImage(imageData).catch((err) => {
              toast.error(err.message);
              return null;
            });
            if (!res) {
              setLoading(false);
              toast.error("Image failed to upload");
              return;
            }

            image = res.data.image;
          }

          updateSpace({
            variables: {
              name: spaceName,
              description_html: spaceDescriptionHtml,
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

      <div className="h-16"></div>
      <Text variant="subheading1" bold>
        Space name
      </Text>
      <div className="h-2"></div>
      <div className="w-96">
        <TextInput value={spaceName} onValueChange={setSpaceName}></TextInput>
      </div>

      <div className="h-8"></div>

      <Text variant="subheading1" bold>
        Space description
      </Text>
      <div className="h-2"></div>
      <div className="w-96">
        <SimpleRichTextInput
          initContent={currentSpace?.description_html ?? ""}
          characterLimit={300}
          onUpdate={({ editor }) => {
            setSpaceDescriptionHtml(editor.getHTML());
          }}
        />
      </div>

      <div className="h-8"></div>

      <Text variant="subheading1" bold>
        Cover image
      </Text>
      <div className="h-2"></div>
      <ImageUploader
        imageSrc={imageSrc}
        onImageSrcChange={setImageSrc}
        height={450}
        width={600}
        showZoom
        renderUploadIcon={() => (
          <BxsCloudUpload className="text-gray-500 h-32 w-32 -mb-2" />
        )}
        getRef={(ref) => {
          editor.current = ref;
        }}
      />
    </div>
  );
}

enum ManageSpaceTabs {
  Members = "Members",
  PrivacySettings = "Privacy Settings",
  EditProfileFormat = "Edit Profile Format",
  EditHomepage = "Edit Homepage",
}

const MAP_TAB_TO_COMPONENT = {
  [ManageSpaceTabs.Members]: MembersList,
  [ManageSpaceTabs.PrivacySettings]: SetPrivacySettings,
  [ManageSpaceTabs.EditProfileFormat]: EditProfileFormat,
  [ManageSpaceTabs.EditHomepage]: EditHomepage,
};

const MAP_TAB_TO_TITLE = {
  [ManageSpaceTabs.Members]: "Members",
  [ManageSpaceTabs.PrivacySettings]: "Privacy Settings",
  [ManageSpaceTabs.EditProfileFormat]: "Edit Profile Format",
  [ManageSpaceTabs.EditHomepage]: "Edit Homepage",
};

const ALL_TABS = Object.values(ManageSpaceTabs);

function ManageSpace() {
  const [selectedTab, setSelectedTab] = useState<ManageSpaceTabs>(
    ManageSpaceTabs.Members
  );

  const Component = MAP_TAB_TO_COMPONENT[selectedTab];
  return (
    <RoundedCard className="w-full">
      <div className="flex items-center gap-2">
        <BxsCog className="h-7 w-7" />
        <Text variant="heading4">Manage Space</Text>
      </div>
      <div className="h-12"></div>
      <div className="flex items-start w-full">
        <div className="flex flex-col items-start whitespace-nowrap">
          <div className="flex flex-col items-end gap-3 w-full">
            {ALL_TABS.map((tab) => {
              const styles = classNames({
                "flex items-center": true,
                "text-gray-600": selectedTab !== tab,
              });
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={styles}
                >
                  <Text variant="body1">{MAP_TAB_TO_TITLE[tab]}</Text>
                  {selectedTab === tab ? (
                    <BxRightArrowAlt className="h-6 w-6" />
                  ) : (
                    <div className="h-6 w-6"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="self-stretch w-0.25 bg-gray-300 shrink-0 mx-8"></div>
        <div className="min-h-screen w-full">
          <Text variant="heading4">{MAP_TAB_TO_TITLE[selectedTab]}</Text>
          <div className="h-8"></div>
          <Component />
        </div>
      </div>
    </RoundedCard>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  if (!currentProfile) {
    return <div>Ur not in this space lol</div>;
  }

  return (
    <SidePadding>
      <Navbar />
      <div className="h-16"></div>
      <Breadcrumbs />
      <div className="h-16"></div>
      <Text variant="heading2">Admin dashboard</Text>
      <div className="h-8"></div>
      <RoundedCard className="w-full">
        <div className="flex items-center gap-2">
          <BxsReport className="h-7 w-7" />
          <Text variant="heading4">Program Overview</Text>
        </div>
      </RoundedCard>
      <div className="h-10"></div>
      <RoundedCard className="w-full">
        <div className="flex items-center gap-2">
          <BxLink className="h-7 w-7" />
          <Text variant="heading4">Invite Members</Text>
        </div>
        <InviteLinksList />
      </RoundedCard>
      <div className="h-10"></div>
      <ManageSpace />
      <div className="h-16"></div>
    </SidePadding>
  );
}
