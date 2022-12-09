import { useEffect, useMemo, useState } from "react";

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";

import {
  ChatIntroDataQuery,
  ChatIntrosQuery,
  useAggregateProfilesQuery,
  useChatIntroDataQuery,
  useChatIntrosQuery,
  useUpdateSpaceAttributesMutation,
  useUpdateSpaceMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import {
  PrivacySettings,
  usePrivacySettings,
} from "../../hooks/usePrivacySettings";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { getCurrentUser } from "../../lib/firebase";
import { Button, Select, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";
import { Table } from "../Table";

type ChatIntro = ChatIntrosQuery["chat_intro"][number];
type ChatIntroData = ChatIntroDataQuery["chat_intro_data"][number];

export function ChatIntroductions() {
  const { currentSpace } = useCurrentSpace();
  const [{ data: profileAggregateData }] = useAggregateProfilesQuery({
    variables: {
      attributes_filter: {
        enableChatIntros: true,
      },
      space_id: currentSpace?.id ?? "",
    },
    pause: !currentSpace,
  });

  const [{ data: chatIntros }, refetchChatIntros] = useChatIntrosQuery({
    variables: {
      space_id: currentSpace?.id ?? "",
    },
    pause: !currentSpace,
  });

  const [{ data: chatIntrosData }] = useChatIntroDataQuery({
    variables: {
      space_id: currentSpace?.id ?? "",
    },
    pause: !currentSpace,
  });

  const chatIntrosDataMap = useMemo(() => {
    if (!chatIntrosData) return {};
    return chatIntrosData.chat_intro_data.reduce((acc, curr) => {
      acc[curr.chat_intro_id ?? "xxx"] = curr;
      return acc;
    }, {} as Record<string, ChatIntroData>);
  }, [chatIntrosData]);

  const defaultColumns: ColumnDef<ChatIntro>[] = useMemo(
    () => [
      {
        id: "created_at",
        accessorFn: (row) => row.created_at,
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
        header: () => <span>Time sent</span>,
      },
      {
        id: "created_by",
        accessorFn: (row) =>
          `${row.creator_profile.user.first_name} ${row.creator_profile.user.last_name}`,
        cell: (info) => info.getValue(),
        header: () => <span>Created by</span>,
      },
      {
        id: "group_size",
        header: () => <span>Group size</span>,
        accessorFn: (row) => row.group_size,
        cell: (info) => info.getValue(),
      },
      {
        id: "num_groups",
        header: () => <span># groups</span>,
        accessorFn: (row) => row.num_groups_created,
        cell: (info) => info.getValue(),
      },
      {
        id: "num_groups_with_msgs",
        header: () => <span># groups w/msgs</span>,
        accessorFn: (row) =>
          chatIntrosDataMap[row.id]?.num_rooms_with_replies ?? 0,
        cell: (info) => info.getValue(),
      },
    ],
    [chatIntrosDataMap]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: chatIntros?.chat_intro ?? [],
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const [groupSize, setGroupSize] = useState<number | null>(null);

  const [loadingSendIntros, setLoadingSendIntros] = useState(false);

  const availableMembers =
    profileAggregateData?.profile_aggregate.aggregate?.count;

  const enoughMembers =
    availableMembers !== undefined &&
    groupSize !== null &&
    availableMembers >= groupSize;

  return (
    <div className="">
      <div className="py-4">
        <Text>(UI/UX is a WIP pls forgive)</Text>
      </div>
      <div className="bg-lime-100 p-4">
        <Text variant="subheading2">
          # available members: <b>{availableMembers ?? "--"}</b>
        </Text>
        <div></div>
        <Text className="text-gray-700" variant="body2">
          Members can opt in to intros in their profile settings.
        </Text>
      </div>
      <div className="h-4"></div>
      <Text>
        Select a group size, then click <b>Send Intros</b> to automatically
        create group chats and notify members that they have been matched. Each
        chat will begin with a conversation starter to help introduce members.
      </Text>
      <div className="h-4"></div>
      <div className="flex items-center">
        <Text>
          Match <b>{availableMembers ?? "--"}</b> members into{" "}
        </Text>
        <Select
          value={groupSize}
          onSelect={(val) => setGroupSize(val)}
          placeholder="Select group size..."
          options={[
            { label: "groups of 2", value: 2 },
            { label: "group of 3", value: 3 },
          ]}
          className="ml-2 w-56"
        ></Select>
        <Button
          disabled={!groupSize || !enoughMembers}
          variant="cta"
          className="ml-4"
          loading={loadingSendIntros}
          onClick={async () => {
            setLoadingSendIntros(true);
            fetch(`/api/services/createGroupChats`, {
              method: "POST",
              headers: {
                authorization: `Bearer ${await getCurrentUser()?.getIdToken()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ groupSize: groupSize }),
            })
              .then((res) => res.json())
              .then(async (res) => {
                if (res.code !== 200) {
                  throw new Error(res.message);
                }
                toast.success("Sent chat intros!");
                refetchChatIntros();
              })
              .catch((err) => {
                toast.error(err.message);
              })
              .finally(() => {
                setLoadingSendIntros(false);
              });
          }}
        >
          Send Intros
        </Button>
      </div>
      {groupSize && !enoughMembers && (
        <div className="mt-0.5">
          <Text variant="body2" style={{ color: "red" }}>
            Need at least {groupSize} available members to send intros
          </Text>
        </div>
      )}
      <div className="h-8"></div>
      <Text variant="subheading1">Sent Intros</Text>
      <div className="h-2"></div>
      <Table table={table} />
      {chatIntros?.chat_intro.length === 0 && (
        <div className="p-2">
          <Text className="text-gray-700">
            Chat intro rounds you send will appear here. Click{" "}
            <b>Send Intros</b> to get started.
          </Text>
        </div>
      )}
    </div>
  );
}
