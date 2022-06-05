import { useMemo, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";

import { EditHomepage } from "../../../components/admin/EditHomepage";
import { EditProfileFormat } from "../../../components/admin/EditProfileFormat";
import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { SetPrivacySettings } from "../../../components/admin/SetPrivacySettings";
import { Text } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { Navbar } from "../../../components/Navbar";
import { RoundedCard } from "../../../components/RoundedCard";
import { SidePadding } from "../../../components/SidePadding";
import { BxLink, BxRightArrowAlt } from "../../../generated/icons/regular";
import { BxsCog, BxsReport } from "../../../generated/icons/solid";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";

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
        <div className="h-8"></div>
        <Text>On the way!</Text>
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
