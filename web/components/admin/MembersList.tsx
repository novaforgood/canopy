import { useMemo, useState } from "react";

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
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
} from "../../generated/graphql";
import {
  BxDotsHorizontalRounded,
  BxSearch,
} from "../../generated/icons/regular";
import { BxsCrown } from "../../generated/icons/solid";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { apiClient } from "../../lib/apiClient";
import { getFullNameOfUser } from "../../lib/user";
import { Button, Text } from "../atomic";
import { Dropdown } from "../atomic/Dropdown";
import { SelectAutocomplete } from "../atomic/SelectAutocomplete";
import { IconButton } from "../buttons/IconButton";
import { Table } from "../common/Table";
import { TextInput } from "../inputs/TextInput";
import { ActionModal } from "../modals/ActionModal";

import { CopyText } from "./CopyText";
import { MAP_ROLE_TO_TITLE, ROLE_SELECT_OPTIONS } from "./roles";

interface Member {
  name: string;
  email?: string;
  role: Profile_Role_Enum;
  profile: ProfilesBySpaceIdQuery["profile"][number];
}

type RoleFilter =
  | Profile_Role_Enum
  | "All"
  | "PrivateProfile"
  | "PublicProfile";

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
  const { currentSpace, refetchCurrentSpace } = useCurrentSpace();

  const [{ data: profilesData }, refetchProfiles] = useProfilesBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
  });
  const [_, updateProfileRole] = useUpdateProfileRoleMutation();

  const members: Member[] = useMemo(
    () =>
      profilesData?.profile
        .filter((profile) => profile.user?.type !== User_Type_Enum.Bot)
        .map((profile) => ({
          name: getFullNameOfUser(profile.user),
          email: profile.user?.email,
          role: profile.profile_roles[0].profile_role,
          profile: profile,
        })) ?? [],
    [profilesData]
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter | null>("All");
  const filteredMembers = useMemo(() => {
    let result = members;
    switch (roleFilter) {
      case "All":
        break;
      case "PrivateProfile":
        result = result.filter(
          (member) => member.role === Profile_Role_Enum.MemberWhoCanList
        );
        result = result.filter(
          (member) => !member.profile.profile_listing?.public
        );
        break;
      case "PublicProfile":
        result = result.filter(
          (member) => member.role === Profile_Role_Enum.MemberWhoCanList
        );
        result = result.filter(
          (member) => member.profile.profile_listing?.public
        );
        break;
      default:
        result = result.filter((member) => member.role === roleFilter);
        break;
    }

    return result.filter((member) => {
      const memberString =
        `${member.name} ${member.email} ${member.role}`.toLowerCase();
      return memberString.includes(search.toLowerCase());
    });
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
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="">
        <Button
          size="small"
          disabled={filteredMembers.length === 0}
          onClick={() => {
            setExportedEmailList(
              filteredMembers
                .map((member) => member.email)
                .filter((email) => !!email)
                .join("\n")
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
      <div className="h-8 shrink-0"></div>
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
                label: "All members",
                value: "All",
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
                label: "Full members (private profile)",
                value: "PrivateProfile",
              },
              {
                label: "Full members (public profile)",
                value: "PublicProfile",
              },
              {
                label: "Admin",
                value: Profile_Role_Enum.Admin,
              },
            ]}
          />
        </div>
      </div>
      <div className="h-4 shrink-0"></div>

      <div className="flex-1 overflow-y-scroll">
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
