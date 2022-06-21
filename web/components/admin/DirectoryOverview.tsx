import { addDays, addMonths, addYears, format } from "date-fns";
import { useState } from "react";
import { useAdminDashDirectoryOverviewQuery } from "../../generated/graphql";
import { BxsReport } from "../../generated/icons/solid";
import { useCurrentProfile } from "../../hooks/useCurrentProfile";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button, Select, Text } from "../atomic";
import { Responsive } from "../Responsive";

enum Directory_Overview_Date_Range_Enum {
  PastWeek = "week",
  PastMonth = "month",
  PastYear = "year",
}

const MAP_DATE_RANGE_TO_TEXT = {
  [Directory_Overview_Date_Range_Enum.PastWeek]: "week",
  [Directory_Overview_Date_Range_Enum.PastMonth]: "month",
  [Directory_Overview_Date_Range_Enum.PastYear]: "year",
};

const MAP_DATE_RANGE_TO_VIEW_DURATION = {
  [Directory_Overview_Date_Range_Enum.PastWeek]: "Weekly View",
  [Directory_Overview_Date_Range_Enum.PastMonth]: "Monthly View",
  [Directory_Overview_Date_Range_Enum.PastYear]: "Yearly View",
};

const dateToday = new Date();
const computeAfterDate = (dateRange: Directory_Overview_Date_Range_Enum) => {
  switch (dateRange) {
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
function DirectoryOverviewInfoBox(props: {
  amount: number | string;
  label: string;
}) {
  return (
    <div className="grow flex flex-col justify-start bg-gray-50 p-4 rounded-lg grow">
      <Text variant="heading3">{props.amount}</Text>
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

  const dateRangeDropdownOptions = Object.values(
    Directory_Overview_Date_Range_Enum
  ).map((type) => {
    return { label: MAP_DATE_RANGE_TO_VIEW_DURATION[type], value: type };
  });

  return (
    <>
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <BxsReport className="h-7 w-7" />
          <Text variant="heading4">Directory Overview</Text>
        </div>
        <Responsive mode="desktop-only">
          <div className="flex items-center gap-2">
            <Button className="h-8">placeholder</Button>
            <Select
              placeholder="Select date range"
              className="w-40"
              options={dateRangeDropdownOptions}
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
        Check out your directory&apos;s activity in the past{" "}
        {DirectoryOverviewDateRange
          ? MAP_DATE_RANGE_TO_TEXT[DirectoryOverviewDateRange]
          : "--"}{" "}
        <span className="text-gray-600">
          {`(since ${format(afterDate, "MM/dd/yyyy")})`}
        </span>
        .
      </Text>
      <div className="h-4"></div>
      <Responsive mode="mobile-only">
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            placeholder="Select date range"
            className="w-40 shrink-0"
            options={dateRangeDropdownOptions}
            value={DirectoryOverviewDateRange}
            onSelect={(selectedValue) =>
              setDirectoryOverviewDateRange(
                // fallback to past week if selectedValue is null
                selectedValue ?? Directory_Overview_Date_Range_Enum.PastWeek
              )
            }
          />
          <Button className="h-8">placeholder</Button>
        </div>
        <div className="h-4"></div>
      </Responsive>
      <div className="grid sm:grid-cols-5 grid-cols-2 gap-4 flex flex-wrap overflow-x-auto">
        <DirectoryOverviewInfoBox
          label="general members"
          amount={adminDashData?.general_member_count.aggregate?.count ?? "--"}
        />
        <DirectoryOverviewInfoBox
          label="listed profiles"
          amount={adminDashData?.listed_profile_count.aggregate?.count ?? "--"}
        />
        <DirectoryOverviewInfoBox
          label="new members"
          amount={adminDashData?.new_member_count.aggregate?.count ?? "--"}
        />
        <DirectoryOverviewInfoBox
          label="requests sent"
          amount={adminDashData?.requests_sent_count.aggregate?.count ?? "--"}
        />
        <DirectoryOverviewInfoBox
          label="confirmed meetings"
          amount={
            adminDashData?.confirmed_meeting_count.aggregate?.count ?? "--"
          }
        />
      </div>
    </>
  );
}
