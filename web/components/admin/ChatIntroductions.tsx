import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  useAggregateProfilesQuery,
  useUpdateSpaceAttributesMutation,
  useUpdateSpaceMutation,
} from "../../generated/graphql";
import { useCurrentSpace } from "../../hooks/useCurrentSpace";
import {
  PrivacySettings,
  usePrivacySettings,
} from "../../hooks/usePrivacySettings";
import { useSaveChangesState } from "../../hooks/useSaveChangesState";
import { Button, Select, Text } from "../atomic";
import { CheckBox } from "../atomic/CheckBox";

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

  const [groupSize, setGroupSize] = useState<number | null>(null);

  const availableMembers =
    profileAggregateData?.profile_aggregate.aggregate?.count;

  const enoughMembers =
    availableMembers !== undefined &&
    groupSize !== null &&
    availableMembers >= groupSize;

  return (
    <div className="">
      <div className="py-4">
        <Text>(UI/UX is a WIP pls forgive) {currentSpace?.id}</Text>
      </div>
      <div className="bg-lime-100 p-4">
        <Text>
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
      <div className="flex gap-2">
        <Select
          value={groupSize}
          onSelect={(val) => setGroupSize(val)}
          placeholder="Select group size..."
          options={[
            { label: "Group size 2", value: 2 },
            { label: "Group size 3", value: 3 },
          ]}
          className="w-56"
        ></Select>
        <Button disabled={!groupSize || !enoughMembers} variant="cta">
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
    </div>
  );
}
