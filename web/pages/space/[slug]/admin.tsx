import { useMemo, useState } from "react";

import classNames from "classnames";
import { useRouter } from "next/router";

import { EditHomepage } from "../../../components/admin/EditHomepage";
import { EditProfileFormat } from "../../../components/admin/EditProfileFormat";
import { InviteLinksList } from "../../../components/admin/InviteLinksList";
import { MembersList } from "../../../components/admin/MembersList";
import { SetPrivacySettings } from "../../../components/admin/SetPrivacySettings";
import { Button, Select, Text } from "../../../components/atomic";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { Navbar } from "../../../components/Navbar";
import { RoundedCard } from "../../../components/RoundedCard";
import { SidePadding } from "../../../components/SidePadding";
import { BxLink, BxRightArrowAlt } from "../../../generated/icons/regular";
import { BxsCog, BxsReport } from "../../../generated/icons/solid";
import { useCurrentProfile } from "../../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../../hooks/useCurrentSpace";
import { useAdminDashProgramOverviewQuery } from "../../../generated/graphql";
import { addDays, addMonths, addYears, format } from "date-fns";

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
    <RoundedCard className="w-full overflow-x-auto">
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
        <div className="min-h-screen sm:w-full">
          <Text variant="heading4">{MAP_TAB_TO_TITLE[selectedTab]}</Text>
          <div className="h-8"></div>
          <Component />
        </div>
      </div>
    </RoundedCard>
  );
}

enum Program_Overview_Date_Range_Enum {
  PastWeek = "week",
  PastMonth = "month",
  PastYear = "year",
}

const MAP_DATE_RANGE_TO_TEXT = {
  [Program_Overview_Date_Range_Enum.PastWeek]: "week",
  [Program_Overview_Date_Range_Enum.PastMonth]: "month",
  [Program_Overview_Date_Range_Enum.PastYear]: "year",
};

const MAP_DATE_RANGE_TO_VIEW_DURATION = {
  [Program_Overview_Date_Range_Enum.PastWeek]: "Weekly View",
  [Program_Overview_Date_Range_Enum.PastMonth]: "Monthly View",
  [Program_Overview_Date_Range_Enum.PastYear]: "Yearly View",
};

const dateRangeDropdownOptions = Object.values(
  Program_Overview_Date_Range_Enum
).map((type) => {
  return { label: MAP_DATE_RANGE_TO_VIEW_DURATION[type], value: type };
});

// boxes that display each program activity stat
function ProgramOverviewInfoBox(props: {
  amount: number | string;
  label: string;
}) {
  return (
    <div className="grow flex flex-col justify-center bg-gray-50 p-4 rounded-lg">
      <Text variant="heading3">{props.amount}</Text>
      <Text variant="body2">{props.label}</Text>
    </div>
  );
}

// uh
const dateToday = new Date();

const computeAfterDate = (dateRange: Program_Overview_Date_Range_Enum) => {
  switch (dateRange) {
    case Program_Overview_Date_Range_Enum.PastWeek:
      return addDays(dateToday, -7);
    case Program_Overview_Date_Range_Enum.PastMonth:
      return addMonths(dateToday, -1);
    case Program_Overview_Date_Range_Enum.PastYear:
      return addYears(dateToday, -1);
    default:
      throw new Error("Invalid date range");
  }
};

export default function AdminPage() {
  const router = useRouter();

  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [programOverviewDateRange, setProgramOverviewDateRange] =
    useState<Program_Overview_Date_Range_Enum>(
      Program_Overview_Date_Range_Enum.PastWeek
    );

  // hack
  const afterDate = computeAfterDate(programOverviewDateRange);

  const [{ data: adminDashData }, refetchAdminDashData] =
    useAdminDashProgramOverviewQuery({
      variables: {
        space_id: currentSpace?.id ?? "",
        after: afterDate.toISOString(),
      },
    });

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BxsReport className="h-7 w-7" />
            <Text variant="heading4">Program Overview</Text>
          </div>
          <div className="flex items-center gap-2">
            <Button>placeholder</Button>
            <Select
              placeholder="Select link type"
              className="w-40"
              options={dateRangeDropdownOptions}
              value={programOverviewDateRange}
              onSelect={(selectedValue) =>
                setProgramOverviewDateRange(
                  // fallback to past week if selectedValue is null
                  selectedValue ?? Program_Overview_Date_Range_Enum.PastWeek
                )
              }
            />
          </div>
        </div>
        <Text>
          Check out your program's activity in the past{" "}
          {programOverviewDateRange
            ? MAP_DATE_RANGE_TO_TEXT[programOverviewDateRange]
            : "--"}{" "}
          <span className="text-gray-600">
            {`(since ${format(afterDate, "MM/dd/yyyy")})`}
          </span>
          .
        </Text>
        <div className="h-4"></div>
        <div className="grid grid-cols-5 gap-4">
          <ProgramOverviewInfoBox
            label="general members"
            amount={
              adminDashData?.general_member_count.aggregate?.count ?? "--"
            }
          />
          <ProgramOverviewInfoBox
            label="listed profiles"
            amount={
              adminDashData?.listed_profile_count.aggregate?.count ?? "--"
            }
          />
          <ProgramOverviewInfoBox
            label="new members"
            amount={adminDashData?.new_member_count.aggregate?.count ?? "--"}
          />
          <ProgramOverviewInfoBox
            label="requests sent"
            amount={adminDashData?.requests_sent_count.aggregate?.count ?? "--"}
          />
          <ProgramOverviewInfoBox
            label="confirmed meetings"
            amount={
              adminDashData?.confirmed_meeting_count.aggregate?.count ?? "--"
            }
          />
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
