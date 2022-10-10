import { Fragment, useMemo, useState } from "react";

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Fuse from "fuse.js";
import toast from "react-hot-toast";

import {
  ProfilesBySpaceIdQuery,
  Profile_Role_Enum,
  useProfilesBySpaceIdQuery,
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

import { CopyText } from "./CopyText";
import { MemberRow } from "./MemberRow";
import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";

interface Member {
  name: string;
  email: string;
  role: Profile_Role_Enum;
  profile: ProfilesBySpaceIdQuery["profile"][number];
}

const options = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: ["title", "author.firstName"],
};

export function MembersList() {
  const { currentSpace } = useCurrentSpace();

  const [{ data: profilesData }] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const [_, updateProfileRole] = useUpdateProfileRoleMutation();

  const members: Member[] = useMemo(
    () =>
      profilesData?.profile.map((profile) => ({
        name: `${profile.user.first_name} ${profile.user.last_name}`,
        email: profile.user.email,
        role: profile.profile_roles[0].profile_role,
        profile: profile,
      })) ?? [],
    [profilesData]
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    Profile_Role_Enum | "All" | null
  >("All");
  const filteredMembers = useMemo(() => {
    let result = members;
    if (roleFilter !== "All") {
      result = result.filter((member) => member.role === roleFilter);
    }

    return result.filter((member) => {
      const memberString =
        `${member.name} ${member.email} ${member.role}`.toLowerCase();
      return memberString.includes(search.toLowerCase());
    });
    // return fuse.search(search);
  }, [members, roleFilter, search]);

  const [exportedEmailList, setExportedEmailList] = useState<string | null>(
    null
  );
  const [exportedEmailListModalOpen, setExportedEmailListModalOpen] =
    useState(false);

  const defaultColumns: ColumnDef<Member>[] = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
      },
      {
        id: "email",
        accessorFn: (row) => row.email,
        cell: (info) => info.getValue(),
        header: () => <span>Email</span>,
      },
      {
        id: "role",
        header: () => <span>Role</span>,
        accessorFn: (row) => row.role,
        cell: (info) => (
          <SelectAutocomplete
            className="w-48"
            options={ROLE_SELECT_OPTIONS}
            value={info.getValue() as Profile_Role_Enum}
            onSelect={async (newRole) => {
              const { profile, name } = info.row.original;

              if (newRole) {
                toast.promise(
                  updateProfileRole({
                    row_id: profile.profile_roles[0].id,
                    profile_role: newRole,
                  }).then((res) => {
                    if (res.error) {
                      throw new Error(res.error.message);
                    } else {
                      return res;
                    }
                  }),
                  {
                    loading: "Loading",
                    success: `Updated ${name}'s role to ${MAP_ROLE_TO_TITLE[newRole]}`,
                    error: "Error when fetching",
                  }
                );
              }
            }}
          />
        ),
      },
    ],
    [updateProfileRole]
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: filteredMembers,
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
      <div className="">
        <Button
          size="small"
          disabled={filteredMembers.length === 0}
          onClick={() => {
            setExportedEmailList(
              filteredMembers.map((member) => member.email).join(",")
            );
            setExportedEmailListModalOpen(true);
          }}
        >
          Copy list of emails
        </Button>
        <Text className="text-gray-700" variant="body2">
          Get filtered emails below in a comma-separated list, which you can
          copy and paste into your email client.
        </Text>
      </div>
      <div className="h-8"></div>
      <div className="flex w-full items-center gap-2">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter members..."
          className="w-full"
          renderPrefix={() => (
            <div>
              <BxSearch className="h-5 w-5" />
            </div>
          )}
        />
        <div className="w-48">
          <SelectAutocomplete
            placeholder="Filter by role"
            value={roleFilter}
            onSelect={setRoleFilter}
            options={[
              {
                label: "All members",
                value: "All",
              },
              ...ROLE_SELECT_OPTIONS,
            ]}
          />
        </div>
      </div>
      <div className="h-4"></div>

      <table className="w-full min-w-[40rem]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left">
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: classNames({
                          "bg-gray-200 p-1 transition": true,
                          "cursor-pointer select-none hover:bg-gray-100":
                            header.column.getCanSort(),
                        }),
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <BxsUpArrow className="ml-1 inline h-3 w-3" />,
                        desc: <BxsDownArrow className="ml-1 inline h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
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
