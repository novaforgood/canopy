import { Space_Invite_Link_Type_Enum } from "../../generated/graphql";

export const MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL: Record<
  Space_Invite_Link_Type_Enum,
  string
> = {
  [Space_Invite_Link_Type_Enum.Member]: "View-only member",
  [Space_Invite_Link_Type_Enum.MemberListingEnabled]:
    "Full member (can list profile)",
};

export const INVITE_LINK_OPTIONS = Object.values(
  Space_Invite_Link_Type_Enum
).map((type) => {
  return {
    label: MAP_INVITE_LINK_TYPE_TO_OPTION_LABEL[type],
    value: type,
  };
});
