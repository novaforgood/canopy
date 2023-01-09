import { Fragment, useMemo, useState } from "react";

import {
  CellContext,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  ProfilesBySpaceIdQuery,
  Profile_Role_Enum,
  useProfilesBySpaceIdQuery,
  useReportsInSpaceQuery,
  useUpdateProfileRoleMutation,
} from "../../generated/graphql";
import {
  BxDownArrow,
  BxSearch,
  BxUpArrow,
} from "../../generated/icons/regular";
import { BxsDownArrow, BxsUpArrow } from "../../generated/icons/solid";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { Button, Text } from "../atomic";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";
import { ProfileImage } from "../ProfileImage";
import { Table } from "../Table";

import { CopyText } from "./CopyText";
import { MemberRow } from "./MemberRow";
import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";

interface ImagesListProps {
  imageUrls: string[];
}

function ImagesList(props: ImagesListProps) {
  const { imageUrls } = props;
  const [show, setShow] = useState(false);

  if (imageUrls.length === 0)
    return <Text className="text-gray-600">None</Text>;
  return (
    <div className="">
      <Button
        variant="secondary"
        size="auto"
        onClick={() => {
          setShow((prev) => !prev);
        }}
      >
        {show ? "Collapse" : "Show"}
      </Button>
      <div className="flex flex-col gap-1">
        {show &&
          imageUrls.map((url, idx) => (
            <a href={url} key={idx} target="_blank" rel="noreferrer">
              <img src={url} alt="image" />
            </a>
          ))}
      </div>
    </div>
  );
}

type Profile = {
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
};
interface ReportTableEntry {
  createdAt: Date;
  description: string;
  imageUrls: string[];
  subjectProfile: Profile;
  reporterProfile?: Profile;
}

export function Reports() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: reportsData }] = useReportsInSpaceQuery({
    variables: {
      space_id: currentSpace?.id ?? "",
    },
  });

  const tableRows: ReportTableEntry[] = useMemo(
    () =>
      reportsData?.report.map((report) => ({
        createdAt: new Date(report.created_at),
        description: report.body,
        imageUrls: report.report_to_images.map((image) => image.image.url),
        subjectProfile: {
          firstName: report.subject_profile.user.first_name ?? "",
          lastName: report.subject_profile.user.last_name ?? "",
          profileImageUrl:
            report.subject_profile.profile_listing?.profile_listing_image?.image
              .url,
        },
        reporterProfile: report.reporter_profile
          ? {
              firstName: report.reporter_profile.user.first_name ?? "",
              lastName: report.reporter_profile.user.last_name ?? "",
              profileImageUrl:
                report.reporter_profile.profile_listing?.profile_listing_image
                  ?.image.url,
            }
          : undefined,
      })) ?? [],
    [reportsData]
  );

  const defaultColumns: ColumnDef<ReportTableEntry>[] = useMemo(
    () => [
      {
        id: "subjectProfile",
        header: () => <span>reported profile</span>,
        accessorFn: (row) => row.subjectProfile,
        cell: (info) => {
          const { firstName, lastName, profileImageUrl } =
            info.getValue() as Profile;
          return (
            <div className="flex items-center">
              <ProfileImage className="mr-2 h-10 w-10" src={profileImageUrl} />
              {firstName} {lastName}
            </div>
          );
        },
      },
      {
        id: "reporterProfile",
        header: () => <span>reported by</span>,
        accessorFn: (row) => row.reporterProfile,
        cell: (info) => {
          if (!info.getValue()) {
            return <Text italic>Anonymous</Text>;
          }
          const { firstName, lastName, profileImageUrl } =
            info.getValue() as Profile;
          return (
            <div className="flex items-center">
              <ProfileImage className="mr-2 h-10 w-10" src={profileImageUrl} />
              {firstName} {lastName}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt,
        cell: (info) =>
          format(new Date(info.getValue() as string), "MMM d, yyyy"),
        header: () => <span>time</span>,
      },
      {
        id: "description",
        accessorFn: (row) => row.description,
        cell: (info) => info.getValue(),
        header: () => <span>description</span>,
      },
      {
        id: "imageUrls",
        header: () => <span>Images</span>,
        accessorFn: (row) => row.imageUrls,
        cell: (info) => {
          const images = info.getValue() as string[];
          return (
            <div className="w-20">
              <ImagesList imageUrls={images} />
            </div>
          );
        },
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: tableRows,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  // Make some columns!

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="">
      <Table table={table} />
    </div>
  );
}
