import { useMemo, useState } from "react";

import {
  ColumnDef,
  Row,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  ChatStatsQuery,
  useAggregateProfilesQuery,
  useChatStatsQuery,
} from "../../generated/graphql";
import {
  BxCaretDown,
  BxChevronDown,
  BxDotsHorizontalRounded,
  BxLinkExternal,
  BxSearch,
} from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { Button, Text } from "../atomic";
import { Calendar } from "../atomic/Calendar";
import { CheckBox } from "../atomic/CheckBox";
import { Dropdown } from "../atomic/Dropdown";
import { Popover } from "../atomic/Popover";
import { IconButton } from "../buttons/IconButton";
import { Table } from "../common/Table";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

import { CopyText } from "./CopyText";

type ChatStats = ChatStatsQuery["get_chat_stats"][number];

export function ChatIntroResults() {
  const { currentSpace } = useCurrentSpace();

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [{ data }, refetchChatStats] = useChatStatsQuery({
    variables: {
      space_id: currentSpace?.id,
      after: date?.toISOString(),
    },
    pause: !currentSpace,
  });
  const [_, refetchAggregateProfiles] = useAggregateProfilesQuery({
    variables: {
      attributes_filter: {
        enableChatIntros: true,
      },
      space_id: currentSpace?.id ?? "",
    },
    pause: !currentSpace,
  });

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.get_chat_stats.filter((row) => {
      const user = row.profile?.user;
      const str = `${user?.full_name} ${user?.email}`.toLowerCase();
      return str.includes(search.toLowerCase());
    });
  }, [data, search]);

  const defaultColumns: ColumnDef<ChatStats>[] = useMemo(
    () => [
      createSelectColumn(),

      {
        id: "name",
        accessorFn: (row) => row.profile?.user?.full_name,
        cell: (info) => {
          const ogRow = info.row.original;
          if (!ogRow.profile?.profile_listing?.public) {
            return <span>{ogRow.profile?.user?.full_name}</span>;
          } else return <span>{ogRow.profile?.user?.full_name}</span>;
        },
        header: () => <span>name</span>,
      },
      {
        id: "profile",
        header: () => <span>profile</span>,
        cell: (info) => {
          const ogRow = info.row.original;
          if (!ogRow.profile?.profile_listing?.public) {
            return <span className="italic text-gray-400">private</span>;
          } else {
            return (
              <a
                className="hover:underline"
                target="_blank"
                rel="noreferrer noopener"
                href={`/space/${currentSpace?.slug}/profile/${ogRow.profile_id}`}
              >
                <span>Link</span>
              </a>
            );
          }
        },
      },
      {
        id: "email",
        accessorFn: (row) => row.profile?.user?.email,
        header: () => <span>email</span>,
      },
      {
        id: "messaged",
        header: () => <span># msged</span>,
        accessorFn: (row) => row.rooms_messaged,
        cell: (info) => (
          <span
            style={{
              color: info.row.original.rooms_messaged == 0 ? "red" : undefined,
            }}
          >
            {info.row.original.rooms_messaged}/{info.row.original.total_rooms}
          </span>
        ),
      },
      {
        id: "read",
        header: () => <span># read</span>,
        accessorFn: (row) => row.rooms_read,
        cell: (info) => (
          <span
            style={{
              color: info.row.original.rooms_read == 0 ? "red" : undefined,
            }}
          >
            {info.row.original.rooms_read}/{info.row.original.total_rooms}
          </span>
        ),
      },
      {
        id: "total",
        header: () => <span># total</span>,
        accessorFn: (row) => row.total_rooms,
      },
      {
        id: "opted_in",
        header: () => <span>opted in</span>,
        accessorFn: (row) => row.profile?.attributes.enableChatIntros ?? false,
        cell: (info) => (
          <span className="flex items-center gap-3">
            <div className="w-4">
              {info.row.original.profile?.attributes.enableChatIntros
                ? "yes"
                : "no"}
            </div>
          </span>
        ),
      },
    ],
    [currentSpace?.slug]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    enableRowSelection(row) {
      return row.original.profile?.attributes.enableChatIntros ?? false;
    },
    data: filteredData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const [exportedEmailList, setExportedEmailList] = useState<string | null>(
    null
  );
  const [exportedEmailListModalOpen, setExportedEmailListModalOpen] =
    useState(false);

  return (
    <div>
      <div className="relative mb-2 flex w-full items-center gap-2">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter members..."
          className="w-full"
          renderPrefix={() => (
            <BxSearch className="mr-1 h-5 w-5 text-gray-700" />
          )}
        />
        <Popover
          renderButton={() => (
            <button
              className={classNames(
                "w-36 shrink-0 justify-start text-right text-sm font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
              <span className="text-gray-400">Since:</span>{" "}
              <span>
                {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
              </span>
            </button>
          )}
        >
          <Calendar
            mode="single"
            toDate={new Date()}
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </Popover>
        <Dropdown
          renderButton={({ dropdownOpen }) => (
            <Button
              disabled={
                !table.getIsAllRowsSelected() && !table.getIsSomeRowsSelected()
              }
            >
              {table.getSelectedRowModel().rows.length} selected
              <BxCaretDown className="ml-2 h-5 w-5" />
            </Button>
          )}
          items={[
            {
              label: "Opt out selected members",
              onClick() {
                const confirmed = confirm(
                  "Are you sure you want to opt out all selected members? Admins can opt members out but cannot opt them back in."
                );
                if (!confirmed) {
                  return;
                }

                const profileIds = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.profile?.id)
                  .filter(Boolean);

                toast.promise(
                  apiClient
                    .post("/api/admin/disableChatIntroForProfiles", {
                      profileIds,
                    })
                    .then(() => {
                      table.resetRowSelection();
                      return Promise.all([
                        refetchChatStats(),
                        refetchAggregateProfiles(),
                      ]);
                    }),
                  {
                    loading: "Loading",
                    success: `Disabled chat intros for selected users`,
                    error: (err) => {
                      return err.message;
                    },
                  }
                );
              },
            },
            {
              label: "Copy email addresses",
              onClick() {
                const emails = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.profile?.user?.email)
                  .filter(Boolean)
                  .join("\n");
                setExportedEmailList(emails);
                setExportedEmailListModalOpen(true);
              },
            },
          ]}
        ></Dropdown>
        {/* <Button
          disabled={
            !table.getIsAllRowsSelected() && !table.getIsSomeRowsSelected()
          }
          onClick={() => {
            const confirmed = confirm(
              "Are you sure you want to opt out all selected members? Admins can opt members out but cannot opt them back in."
            );
            if (!confirmed) {
              return;
            }

            const profileIds = table
              .getSelectedRowModel()
              .rows.map((row) => row.original.profile?.id)
              .filter(Boolean);

            toast.promise(
              apiClient
                .post("/api/admin/disableChatIntroForProfiles", {
                  profileIds,
                })
                .then(() => {
                  table.resetRowSelection();
                  return Promise.all([
                    refetchChatStats(),
                    refetchAggregateProfiles(),
                  ]);
                }),
              {
                loading: "Loading",
                success: `Disabled chat intros for selected users`,
                error: (err) => {
                  return err.message;
                },
              }
            );
          }}
        >
          Opt out selected members
        </Button> */}
      </div>
      <div className="max-h-120 overflow-y-auto">
        <Table table={table} />
      </div>

      <ActionModal
        isOpen={exportedEmailListModalOpen}
        onClose={() => {
          setExportedEmailListModalOpen(false);
        }}
        onAction={() => {
          setExportedEmailListModalOpen(false);
        }}
        actionText="Done"
      >
        <div className="h-full rounded-md bg-white px-4 py-16 sm:px-12">
          <div className="flex flex-col items-center">
            <Text variant="heading4">Export emails</Text>
            <div className="h-8"></div>
            <Text className="w-96 text-gray-700" variant="body2">
              Copy this list of emails and paste it into your email client.
            </Text>
            <div className="h-4"></div>
            <CopyText breakAll text={exportedEmailList ?? ""} />
          </div>
        </div>
      </ActionModal>
    </div>
  );
}

export function createSelectColumn<T>(): ColumnDef<T> {
  let lastSelectedId = "";

  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <div className="pointer-events-none w-0 opacity-0">dummy</div>
        <CheckBox
          id="select-all"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row, table }) => (
      <CheckBox
        disabled={!row.getCanSelect()}
        id={`select-row-${row.id}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => {
          if (e.shiftKey) {
            const { rows, rowsById } = table.getRowModel();
            try {
              const rowsToToggle = getRowRange(rows, row.id, lastSelectedId);
              const isLastSelected = rowsById[lastSelectedId].getIsSelected();
              rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
            } catch (e) {
              // Show the user a message
              toast.error(
                "Multi-select with shift+click is disabled across multiple pages"
              );
              row.toggleSelected(!row.getIsSelected());
            }
          } else {
            row.toggleSelected(!row.getIsSelected());
          }
          lastSelectedId = row.id;
        }}
      />
    ),
    maxSize: 50,
  };
}

function getRowRange<T>(rows: Array<Row<T>>, idA: string, idB: string) {
  const range: Array<Row<T>> = [];
  let foundStart = false;
  let foundEnd = false;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.id === idA || row.id === idB) {
      if (foundStart) {
        foundEnd = true;
      }
      if (!foundStart) {
        foundStart = true;
      }
    }
    if (foundStart) {
      range.push(row);
    }
    if (foundEnd) {
      break;
    }
  }
  // added this check
  if (!foundEnd) {
    throw Error("Could not find whole row range");
  }
  return range;
}
