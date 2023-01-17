import { useMemo, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";

import { DirectoryOverview } from "../../../../components/admin/DirectoryOverview";
import { EditProfileTags } from "../../../../components/admin/edit-profile-tags/EditProfileTags";
import { EditHomepage } from "../../../../components/admin/EditHomepage";
import { EditProfileFormat } from "../../../../components/admin/EditProfileFormat";
import { InviteLinksList } from "../../../../components/admin/InviteLinksList";
import { MembersList } from "../../../../components/admin/MembersList";
import { Reports } from "../../../../components/admin/Reports";
import { SetPrivacySettings } from "../../../../components/admin/SetPrivacySettings";
import { Select, Text } from "../../../../components/atomic";
import { RoundedCard } from "../../../../components/common/RoundedCard";
import { Responsive } from "../../../../components/layout/Responsive";
import { SidePadding } from "../../../../components/layout/SidePadding";
import { Navbar } from "../../../../components/navbar/Navbar";
import { BxLink, BxRightArrowAlt } from "../../../../generated/icons/regular";
import { BxsCog } from "../../../../generated/icons/solid";
import { useCurrentProfile } from "../../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../../hooks/useCurrentSpace";
import { useSaveChangesState } from "../../../../hooks/useSaveChangesState";

enum ManageSpaceTabs {
  Members = "Members",
  Reports = "Reports",
  PrivacySettings = "Privacy Settings",
  EditProfileFormat = "Edit Profile Format",
  EditProfileTags = "Edit Tags",
  EditHomepage = "Edit Homepage",
}

const MAP_TAB_TO_COMPONENT = {
  [ManageSpaceTabs.Members]: MembersList,
  [ManageSpaceTabs.Reports]: Reports,
  [ManageSpaceTabs.PrivacySettings]: SetPrivacySettings,
  [ManageSpaceTabs.EditProfileFormat]: EditProfileFormat,
  [ManageSpaceTabs.EditProfileTags]: EditProfileTags,
  [ManageSpaceTabs.EditHomepage]: EditHomepage,
};

const MAP_TAB_TO_TITLE = {
  [ManageSpaceTabs.Members]: "Members",
  [ManageSpaceTabs.Reports]: "Reports",
  [ManageSpaceTabs.PrivacySettings]: "Privacy Settings",
  [ManageSpaceTabs.EditProfileFormat]: "Edit Profile Format",
  [ManageSpaceTabs.EditProfileTags]: "Edit Profile Tags",
  [ManageSpaceTabs.EditHomepage]: "Edit Homepage",
};

const ALL_TABS = Object.values(ManageSpaceTabs);

function ManageSpace() {
  const [selectedTab, setSelectedTab] = useState<ManageSpaceTabs>(
    ManageSpaceTabs.Members
  );

  const Component = useMemo(
    () => MAP_TAB_TO_COMPONENT[selectedTab],
    [selectedTab]
  );

  const { validateChangesSaved } = useSaveChangesState();

  return (
    <RoundedCard className="flex min-h-screen w-full flex-col overflow-x-auto">
      <div className="flex items-center gap-2">
        <BxsCog className="h-7 w-7" />
        <Text variant="heading4">Manage Space</Text>
      </div>
      <div className="h-6 shrink-0 sm:h-12"></div>
      <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
        <Responsive mode="desktop-only">
          <div className="flex flex-col items-start whitespace-nowrap">
            <div className="flex w-full flex-col items-end gap-3">
              {ALL_TABS.map((tab) => {
                const styles = classNames({
                  "flex items-center": true,
                  "text-gray-600": selectedTab !== tab,
                });
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      validateChangesSaved().then((leave) => {
                        if (leave) setSelectedTab(tab);
                      });
                    }}
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
        </Responsive>
        <Responsive mode="desktop-only" className="self-stretch">
          <div className="mx-8 h-full w-0.25 shrink-0 self-stretch bg-gray-300"></div>
        </Responsive>
        <Responsive mode="mobile-only" className="w-full">
          <Select
            className="w-full shadow-md"
            options={ALL_TABS.map((tab) => ({
              label: MAP_TAB_TO_TITLE[tab],
              value: tab,
            }))}
            value={selectedTab}
            onSelect={(newVal) => {
              if (newVal) {
                setSelectedTab(newVal);
              }
            }}
          />
          <div className="h-8"></div>
        </Responsive>

        <div className="flex-1 grow self-stretch overflow-y-auto sm:w-full">
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
    <div className="bg-gray-50">
      <Navbar />
      <SidePadding className="min-h-screen">
        <div className="h-16"></div>
        {/* <Breadcrumbs />
        <div className="h-16"></div> */}
        <Text variant="heading2">Admin dashboard</Text>
        <div className="h-8"></div>
        <RoundedCard className="w-full">
          <DirectoryOverview />
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
        {/* <RoundedCard className="w-full">
          <div className="flex items-center gap-2">
            <BxTransfer className="h-7 w-7" />
            <Text variant="heading4">Chat Introductions</Text>
          </div>
          <ChatIntroductions />
        </RoundedCard>
        <div className="h-10"></div> */}
        <ManageSpace />
        <div className="h-16"></div>
      </SidePadding>
    </div>
  );
}
