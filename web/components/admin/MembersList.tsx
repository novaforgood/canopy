import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { Listbox, Transition } from "@headlessui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";

import {
  ProfilesBySpaceIdQuery,
  Profile_Role_Enum,
  useProfilesBySpaceIdQuery,
  User_Type_Enum,
  useUpdateProfileRoleMutation,
  useUpdateProfileRolesMutation,
} from "../../generated/graphql";
import {
  BxDotsHorizontalRounded,
  BxSearch,
  BxChevronDown,
  BxCaretDown,
} from "../../generated/icons/regular";
import { BxsCrown } from "../../generated/icons/solid";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import {
  ProfileAttributes,
  resolveProfileAttributes,
} from "../../lib/profileAttributes";
import { getFullNameOfUser } from "../../lib/user";
import { Button, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";
import { Dropdown } from "../atomic/Dropdown";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { IconButton } from "../buttons/IconButton";
import { Table } from "../common/Table";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

import { CopyText } from "./CopyText";
import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";
import classNames from "classnames";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: Profile_Role_Enum;
  profile: ProfilesBySpaceIdQuery["profile"][number];
  profileAttributes: ProfileAttributes;
}

type RoleFilter =
  | Profile_Role_Enum
  | "All"
  | "ActiveMembers"
  | "InactiveMembers";

const options = {
  keys: ["title", "author.firstName"],
};

type FilterConfig =
  | {
      label: string;
      type: "string";
      value: string | null;
      onChange: (value: string) => void;
    }
  | {
      label: string;
      type: "boolean";
      value: boolean | null;
      onChange: (value: boolean) => void;
    };

interface FilterBarProps {
  filters: FilterConfig[];
}

const FilterBar: React.FC<FilterBarProps> = ({ filters }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2">
          <label className="font-medium">{filter.label}</label>
          {filter.type === "string" ? (
            <TextInput
              value={filter.value as string}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-40"
            />
          ) : (
            <Listbox value={filter.value} onChange={filter.onChange}>
              <div className="relative">
                <Listbox.Button
                  className={classNames(
                    "relative flex w-full cursor-pointer items-center justify-between rounded border px-2 py-1 text-left outline-none ring-0",
                    {
                      "border-black": open,
                      "border-gray-400": !open,
                    }
                  )}
                >
                  <span className="block truncate">
                    {filter.value === null
                      ? "Any"
                      : filter.value
                      ? "Yes"
                      : "No"}
                  </span>
                  <BxCaretDown className="h-4 w-4" />
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white
                    py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  >
                    <Listbox.Option
                      value={null}
                      className={({ active }) =>
                        `${
                          active && "bg-gray-100"
                        } relative cursor-pointer select-none px-2 py-1`
                      }
                    >
                      Any
                    </Listbox.Option>
                    <Listbox.Option
                      value={true}
                      className={({ active }) =>
                        `${
                          active && "bg-gray-100"
                        } relative cursor-pointer select-none px-2 py-1`
                      }
                    >
                      Yes
                    </Listbox.Option>
                    <Listbox.Option
                      value={false}
                      className={({ active }) =>
                        `${
                          active && "bg-gray-100"
                        } relative cursor-pointer select-none px-2 py-1`
                      }
                    >
                      No
                    </Listbox.Option>
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}
        </div>
      ))}
    </div>
  );
};

export function MembersList() {
  const { currentSpace, refetchCurrentSpace } = useCurrentSpace();

  const [{ data: profilesData }, refetchProfiles] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const [, updateProfileRole] = useUpdateProfileRoleMutation();
  const [, updateProfileRoles] = useUpdateProfileRolesMutation();

  const members: Member[] = useMemo(
    () =>
      profilesData?.profile
        .filter((profile) => profile.user?.type !== User_Type_Enum.Bot)
        .map((profile) => ({
          id: profile.id,
          name: getFullNameOfUser(profile.user),
          email: profile.user?.email,
          role: profile.profile_roles[0].profile_role,
          profile: profile,
          profileAttributes: resolveProfileAttributes(profile.attributes),
        })) ?? [],
    [profilesData]
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter | null>(
    "ActiveMembers"
  );
  const [selectedMembers, setSelectedMembers] = useState<RowSelectionState>({});
  const [publicProfileFilter, setPublicProfileFilter] = useState<
    boolean | null
  >(null);
  const [optedInFilter, setOptedInFilter] = useState<boolean | null>(null);

  const { regularMembers, adminMembers } = useMemo(() => {
    const regular = members.filter(
      (member) => member.role !== Profile_Role_Enum.Admin
    );
    const admins = members.filter(
      (member) => member.role === Profile_Role_Enum.Admin
    );
    return { regularMembers: regular, adminMembers: admins };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = regularMembers;
    const inactiveRoles = [
      Profile_Role_Enum.Archived,
      Profile_Role_Enum.Banned,
    ];
    switch (roleFilter) {
      case "All":
        break;
      case "ActiveMembers":
        result = result.filter(
          (member) => !inactiveRoles.includes(member.role)
        );
        break;
      case "InactiveMembers":
        result = result.filter((member) => inactiveRoles.includes(member.role));
        break;
      default:
        result = result.filter((member) => member.role === roleFilter);
        break;
    }

    if (publicProfileFilter !== null) {
      result = result.filter(
        (member) =>
          (member.profile.profile_listing?.public ?? false) ===
          publicProfileFilter
      );
    }

    if (optedInFilter !== null) {
      result = result.filter(
        (member) =>
          (member.profileAttributes.enableChatIntros ?? false) === optedInFilter
      );
    }

    return result.filter((member) => {
      const memberString =
        `${member.name} ${member.email} ${member.role}`.toLowerCase();
      return memberString.includes(search.toLowerCase());
    });
  }, [regularMembers, roleFilter, search, publicProfileFilter, optedInFilter]);

  const [exportedEmailList, setExportedEmailList] = useState<string | null>(
    null
  );
  const [exportedEmailListModalOpen, setExportedEmailListModalOpen] =
    useState(false);
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [selectedNewRole, setSelectedNewRole] =
    useState<Profile_Role_Enum | null>(null);

  const defaultColumns: ColumnDef<Member>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex h-6 items-center">
            <CheckBox
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <CheckBox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        id: "name",
        accessorFn: (row) => row.name,
        cell: (info) => {
          const { name, profile } = info.row.original;
          return (
            <div className="flex items-center">
              <Text>{name}</Text>
              {profile.user_id === currentSpace?.owner_id && (
                <BxsCrown className="ml-1 h-4 w-4 text-gray-500" />
              )}
            </div>
          );
        },
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
                      if (!res.data?.update_profile_to_profile_role_by_pk) {
                        throw new Error(
                          "You are not permitted to change this role."
                        );
                      }
                      return res;
                    }
                  }),
                  {
                    loading: "Loading",
                    success: `Updated ${name}'s role to ${MAP_ROLE_TO_TITLE[newRole]}`,
                    error: (err) => {
                      return err.message || "Error when fetching";
                    },
                  }
                );
              }
            }}
          />
        ),
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        sort: false,
        cell: (info) => {
          const { profile } = info.row.original;
          return (
            <Dropdown
              renderButton={() => {
                return (
                  <IconButton
                    icon={
                      <BxDotsHorizontalRounded className="h-4 w-4 text-gray-700" />
                    }
                    className="rounded-full"
                  />
                );
              }}
              items={[
                {
                  label: "Make owner",
                  hide:
                    profile.user_id === currentSpace?.owner_id ||
                    !profile.user_id,
                  onClick: () => {
                    if (!currentSpace?.id || !profile.user_id) {
                      return;
                    }
                    toast.promise(
                      apiClient
                        .post("/api/admin/transferSpaceOwnership", {
                          spaceId: currentSpace.id,
                          toUserId: profile.user_id,
                        })
                        .then(refetchCurrentSpace),
                      {
                        loading: "Loading",
                        success: `Made ${info.row.original.name} the owner`,
                        error: (err) => {
                          return err.message;
                        },
                      }
                    );
                  },
                },
              ]}
            />
          );
        },
      },
    ],
    [
      currentSpace?.id,
      currentSpace?.owner_id,
      refetchCurrentSpace,
      updateProfileRole,
    ]
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setSelectedMembers({});
  }, [filteredMembers]);

  const table = useReactTable({
    getRowId: (row) => row.id,
    data: filteredMembers,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting, rowSelection: selectedMembers },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setSelectedMembers,
  });

  const adminTable = useReactTable({
    getRowId: (row) => row.id,
    data: adminMembers,
    columns: defaultColumns.filter((col) => col.id !== "select"),
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const handleMassAction = useCallback(
    (action: string, newRole?: Profile_Role_Enum) => {
      const selectedMemberIds = Object.keys(selectedMembers).filter(
        (id) => selectedMembers[id]
      );

      switch (action) {
        case "changeRole":
          setChangeRoleModalOpen(true);
          break;
        case "copyEmails": {
          const selectedEmails = filteredMembers
            .filter((member) => selectedMemberIds.includes(member.id))
            .map((member) => member.email)
            .filter((email) => !!email)
            .join("\n");
          setExportedEmailList(selectedEmails);
          setExportedEmailListModalOpen(true);
          break;
        }
        default:
          console.log("Unknown action:", action);
      }
    },
    [filteredMembers, selectedMembers]
  );

  const handleChangeRole = useCallback(() => {
    if (!selectedNewRole) return;

    const roleRowIds = filteredMembers
      .filter((member) => !!selectedMembers[member.id])
      .map((member) => member.profile.profile_roles[0].id)
      .filter(Boolean);

    toast.promise(
      updateProfileRoles({
        row_ids: roleRowIds,
        profile_role: selectedNewRole,
      }).then((res) => {
        if (res.error) {
          throw new Error(res.error.message);
        } else {
          refetchProfiles();
          setSelectedMembers({});
          setChangeRoleModalOpen(false);
          setSelectedNewRole(null);
          return res;
        }
      }),
      {
        loading: "Changing roles...",
        success: `Updated roles to ${MAP_ROLE_TO_TITLE[selectedNewRole]}`,
        error: "Failed to change roles",
      }
    );
  }, [
    selectedNewRole,
    selectedMembers,
    filteredMembers,
    updateProfileRoles,
    refetchProfiles,
  ]);

  const filters: FilterConfig[] = useMemo(
    () => [
      {
        label: "Public Profile",
        type: "boolean",
        value: publicProfileFilter,
        onChange: setPublicProfileFilter,
      },
      {
        label: "Opted In",
        type: "boolean",
        value: optedInFilter,
        onChange: setOptedInFilter,
      },
    ],
    [publicProfileFilter, optedInFilter]
  );

  if (!currentSpace) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Text variant="subheading1" bold className="mb-2">
        Admins
      </Text>
      <Table table={adminTable} />
      <div className="h-8"></div>

      <Text variant="subheading1" bold className="mb-2">
        Regular Members
      </Text>
      <div className="flex w-full items-center gap-2">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter members..."
          className="w-full"
          renderPrefix={() => (
            <BxSearch className="mr-1 h-5 w-5 text-gray-700" />
          )}
        />
        <div className="z-20 w-80">
          <SelectAutocomplete
            placeholder="Filter by role"
            value={roleFilter}
            onSelect={setRoleFilter}
            options={[
              {
                label: "Active Members",
                value: "ActiveMembers",
              },
              {
                label: "View-only members",
                value: Profile_Role_Enum.Member,
              },
              {
                label: "Full members",
                value: Profile_Role_Enum.MemberWhoCanList,
              },
              {
                label: "Inactive Members",
                value: "InactiveMembers",
              },
              {
                label: "Banned members",
                value: Profile_Role_Enum.Banned,
              },
              {
                label: "Archived members",
                value: Profile_Role_Enum.Archived,
              },
              {
                label: "All members",
                value: "All",
              },
            ]}
          />
        </div>
      </div>
      <div className="h-4 shrink-0"></div>

      <FilterBar filters={filters} />
      <div className="h-4"></div>
      <div className="mb-4 flex items-center gap-2">
        <Dropdown
          placement="left"
          renderButton={() => (
            <Button
              size="small"
              disabled={Object.keys(selectedMembers).length === 0}
              className="flex items-center"
            >
              Selected ({Object.keys(selectedMembers).length})
              <BxChevronDown className="ml-1 h-4 w-4" />
            </Button>
          )}
          items={[
            {
              label: "Change Members' Roles",
              onClick: () => handleMassAction("changeRole"),
            },
            {
              label: "Copy Email List",
              onClick: () => handleMassAction("copyEmails"),
            },
          ]}
        />
      </div>

      <div className="max-h-screen flex-1 overflow-y-scroll">
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

      <ActionModal
        isOpen={changeRoleModalOpen}
        onClose={() => {
          setChangeRoleModalOpen(false);
          setSelectedNewRole(null);
        }}
        onAction={handleChangeRole}
        actionText="Change Roles"
        actionDisabled={!selectedNewRole}
      >
        <div className="h-full rounded-md bg-white px-4 py-16 sm:px-12">
          <div className="flex flex-col items-center">
            <Text variant="heading4">Change Members&apos; Roles</Text>
            <div className="h-8"></div>
            <Text className="w-96 text-center text-gray-700" variant="body2">
              Select a new role for the selected members:
            </Text>
            <div className="h-4"></div>
            <SelectAutocomplete
              options={ROLE_SELECT_OPTIONS.filter(
                (option) => option.value !== Profile_Role_Enum.Admin
              )}
              value={selectedNewRole}
              onSelect={setSelectedNewRole}
              placeholder="Select a role"
              className="w-64"
            />
            <div className="h-8"></div>
            <Text className="w-96 text-center text-gray-700" variant="body2">
              {Object.keys(selectedMembers).length} member(s) will be affected
              by this change.
            </Text>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
