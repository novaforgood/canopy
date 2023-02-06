import { useMemo, useState } from "react";

import { Disclosure } from "@headlessui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  ChatIntroDataQuery,
  ChatIntrosQuery,
  useAggregateProfilesQuery,
  useChatIntroDataQuery,
  useChatIntrosQuery,
} from "../../generated/graphql";
import { BxChevronDown, BxChevronRight } from "../../generated/icons/regular";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import { useQueryParam } from "../../hooks/useQueryParam";
import { getCurrentUser } from "../../lib/firebase";
import { getFullNameOfUser } from "../../lib/user";
import { Button, Select, Text } from "../atomic";
import { Table } from "../common/Table";

type ChatIntro = ChatIntrosQuery["chat_intro"][number];
type ChatIntroData = ChatIntroDataQuery["chat_intro_data"][number];

export function ChatIntroductions() {
  const router = useRouter();
  const spaceSlug = useQueryParam("slug", "string");
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
        cell: (info) =>
          format(new Date(info.getValue() as string), "MMM d, yyyy"),
        header: () => <span>date</span>,
      },
      {
        id: "created_by",
        accessorFn: (row) => getFullNameOfUser(row.creator_profile.user),
        cell: (info) => info.getValue(),
        header: () => <span>created by</span>,
      },
      {
        id: "num_people_matched",
        header: () => <span># matched</span>,
        accessorFn: (row) => row.num_people_matched,
        cell: (info) => info.getValue(),
      },
      {
        id: "group_size",
        header: () => <span>group size</span>,
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
        header: () => <span>reply rate</span>,
        cell: (info) =>
          `${
            chatIntrosDataMap[info.row.original.id]?.num_rooms_with_replies ?? 0
          }/${info.row.original.num_groups_created}`,
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

  const settingsUrl = `${window.location.origin}/space/${currentSpace?.slug}/account/settings`;

  return (
    <div className="">
      <div>
        <Text variant="subheading2" medium>
          Step 1: Invite Members to Opt In
        </Text>
        <div className="h-2"></div>
      </div>
      <Text>
        In order to be matched, members must first <Text bold>opt in</Text> in
        their account settings. You can <Text bold>send an announcement</Text>{" "}
        to invite members to opt in. Click below to access a pre-made template.
      </Text>
      <div className="h-2"></div>
      <Button
        variant="cta"
        onClick={() => {
          router.push(`/space/${spaceSlug}/announcements?template=chat-intros`);
        }}
      >
        See announcement template
      </Button>
      <div className="h-4"></div>
      <div className="bg-lime-100 p-4">
        <Text variant="subheading2">
          # opted-in members: <b>{availableMembers ?? "--"}</b>
        </Text>
        <div></div>
        <Text className="text-gray-700" variant="body2">
          Members can opt in to intros in their account settings at{" "}
          <a href={settingsUrl} className="text-gray-700 hover:underline">
            {settingsUrl}
          </a>
        </Text>
      </div>
      <div className="h-8"></div>
      <div>
        <Text variant="subheading2" medium>
          Step 2: Create Intros
        </Text>
        <div className="h-2"></div>
      </div>
      <Text>
        Select a group size, then click <b>Send Intros</b> to automatically
        create group chats and notify members that they have been matched. Each
        chat will have a question to help start the conversation.
      </Text>
      <div className="h-4"></div>
      <div className="flex flex-wrap items-center">
        <Text>
          Match <b>{availableMembers ?? "--"}</b> members into{" "}
        </Text>
        <Select
          value={groupSize}
          onSelect={(val) => setGroupSize(val)}
          placeholder="Select group size..."
          options={[
            { label: "groups of 2", value: 2 },
            { label: "groups of 3", value: 3 },
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
      <div>
        <Text variant="subheading2" medium>
          Step 3: View Results
        </Text>
        <div className="h-2"></div>
      </div>
      <Text>Once you send intros, you can see the results here.</Text>
      <div className="h-2"></div>
      <Disclosure>
        <Disclosure.Button className="flex w-full items-center rounded-md bg-gray-100 p-2 py-2">
          <Text variant="subheading1">View Sent Intros</Text>
          <BxChevronDown className="ui-open:rotate-90 ui-open:transform h-6 w-6" />
        </Disclosure.Button>
        <Disclosure.Panel>
          <div className="h-2"></div>
          <Table table={table} />
        </Disclosure.Panel>
      </Disclosure>

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
