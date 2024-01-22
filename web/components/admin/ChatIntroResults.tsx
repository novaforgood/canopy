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
import toast from "react-hot-toast";

import {
  ChatStatsQuery,
  useAggregateProfilesQuery,
  useChatStatsQuery,
} from "../../generated/graphql";
import {
  BxDotsHorizontalRounded,
  BxSearch,
} from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { Button } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";
import { Dropdown } from "../atomic/Dropdown";
import { IconButton } from "../buttons/IconButton";
import { Table } from "../common/Table";
import { TextInput } from "../inputs/TextInput";

type ChatStats = ChatStatsQuery["get_chat_stats"][number];

export function ChatIntroResults() {
  const { currentSpace } = useCurrentSpace();

  const [{ data }, refetchChatStats] = useChatStatsQuery({
    variables: {
      space_id: currentSpace?.id,
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
        header: () => <span>name</span>,
      },
      {
        id: "email",
        accessorFn: (row) => row.profile?.user?.email,
        header: () => <span>email</span>,
      },
      {
        id: "messaged",
        header: () => <span># intros msged</span>,
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
        header: () => <span># intros seen</span>,
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
        header: () => <span># total intros</span>,
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
    []
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
        <Button
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
        </Button>
      </div>
      <div className="max-h-120 overflow-y-auto">
        <Table table={table} />
      </div>
    </div>
  );
}

export function createSelectColumn<T>(): ColumnDef<T> {
  let lastSelectedId = "";

  return {
    id: "select",
    header: ({ table }) => (
      <CheckBox
        id="select-all"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
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
