import { useState } from "react";

import { addDays, addMonths, addYears, format } from "date-fns";

import { useAdminDashDirectoryOverviewQuery } from "../../generated/graphql";
import { BxStar } from "../../generated/icons/regular";
import { BxsReport } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button, Select, Text } from "../atomic";
import { Responsive } from "../layout/Responsive";

enum Directory_Overview_Date_Range_Enum {
  PastDay = "day",
  PastWeek = "week",
  PastMonth = "month",
  PastYear = "year",
}

const MAP_DATE_RANGE_TO_TEXT = {
  [Directory_Overview_Date_Range_Enum.PastDay]: "day",
  [Directory_Overview_Date_Range_Enum.PastWeek]: "week",
  [Directory_Overview_Date_Range_Enum.PastMonth]: "month",
  [Directory_Overview_Date_Range_Enum.PastYear]: "year",
};

const MAP_DATE_RANGE_TO_VIEW_DURATION = {
  [Directory_Overview_Date_Range_Enum.PastDay]: "Past day",
  [Directory_Overview_Date_Range_Enum.PastWeek]: "Past week",
  [Directory_Overview_Date_Range_Enum.PastMonth]: "Past month",
  [Directory_Overview_Date_Range_Enum.PastYear]: "Past year",
};

const DATE_RANGE_DROPDOWN_OPTIONS = Object.values(
  Directory_Overview_Date_Range_Enum
).map((type) => {
  return { label: MAP_DATE_RANGE_TO_VIEW_DURATION[type], value: type };
});

const dateToday = new Date();
const computeAfterDate = (dateRange: Directory_Overview_Date_Range_Enum) => {
  switch (dateRange) {
    case Directory_Overview_Date_Range_Enum.PastDay:
      return addDays(dateToday, -1);
    case Directory_Overview_Date_Range_Enum.PastWeek:
      return addDays(dateToday, -7);
    case Directory_Overview_Date_Range_Enum.PastMonth:
      return addMonths(dateToday, -1);
    case Directory_Overview_Date_Range_Enum.PastYear:
      return addYears(dateToday, -1);
    default:
      throw new Error("Invalid date range");
  }
};

// boxes that display each Directory activity stat
function DirectoryOverviewInfoBox(props: { amount?: number; label: string }) {
  return (
    <div className="flex grow flex-col justify-start rounded-lg bg-gray-100 p-4">
      <Text variant="heading3">{props.amount ? props.amount : 0}</Text>
      <Text variant="body2">{props.label}</Text>
    </div>
  );
}

export function DirectoryOverview() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [DirectoryOverviewDateRange, setDirectoryOverviewDateRange] =
    useState<Directory_Overview_Date_Range_Enum>(
      Directory_Overview_Date_Range_Enum.PastWeek
    );

  // hack
  const afterDate = computeAfterDate(DirectoryOverviewDateRange);

  const [{ data: adminDashData }, refetchAdminDashData] =
    useAdminDashDirectoryOverviewQuery({
      variables: {
        space_id: currentSpace?.id ?? "",
        after: afterDate.toISOString(),
      },
    });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <BxStar className="h-7 w-7" />
          <Text variant="heading4">Directory Overview</Text>
        </div>
        <Responsive mode="desktop-only">
          <div className="flex items-center gap-2">
            <Select
              placeholder="Select date range"
              className="w-40"
              options={DATE_RANGE_DROPDOWN_OPTIONS}
              value={DirectoryOverviewDateRange}
              onSelect={(selectedValue) =>
                setDirectoryOverviewDateRange(
                  // fallback to past week if selectedValue is null
                  selectedValue ?? Directory_Overview_Date_Range_Enum.PastWeek
                )
              }
            />
          </div>
        </Responsive>
      </div>
      <div className="h-4 sm:h-8"></div>
      <Text>
        Check out your {"directory's"} activity in the{" "}
        <Text bold>
          past{" "}
          {DirectoryOverviewDateRange
            ? MAP_DATE_RANGE_TO_TEXT[DirectoryOverviewDateRange]
            : "--"}
        </Text>{" "}
        <span className="text-gray-600">
          {`(since ${format(afterDate, "MMMM dd, yyyy")})`}
        </span>
        .
      </Text>
      <div className="h-4"></div>
      <Responsive mode="mobile-only">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            placeholder="Select date range"
            className="w-40 shrink-0"
            options={DATE_RANGE_DROPDOWN_OPTIONS}
            value={DirectoryOverviewDateRange}
            onSelect={(selectedValue) =>
              setDirectoryOverviewDateRange(
                // fallback to past week if selectedValue is null
                selectedValue ?? Directory_Overview_Date_Range_Enum.PastWeek
              )
            }
          />
          {/* <Button className="h-8">placeholder</Button> */}
        </div>
        <div className="h-4"></div>
      </Responsive>
      <div className="grid grid-cols-2 gap-4 overflow-x-auto sm:grid-cols-5">
        <DirectoryOverviewInfoBox
          label="general members"
          amount={adminDashData?.general_member_count.aggregate?.count}
        />
        <DirectoryOverviewInfoBox
          label="listed profiles"
          amount={adminDashData?.listed_profile_count.aggregate?.count}
        />
        <DirectoryOverviewInfoBox
          label="new members"
          amount={adminDashData?.new_member_count.aggregate?.count}
        />
        <DirectoryOverviewInfoBox
          label="total profile views"
          amount={adminDashData?.profile_views_count.aggregate?.count}
        />
        <DirectoryOverviewInfoBox
          label="total messages sent"
          amount={adminDashData?.chat_messages_count.aggregate?.count}
        />
      </div>
    </>
  );
}
