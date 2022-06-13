import { Profile_Role_Enum } from "../../generated/graphql";

export const MAP_ROLE_TO_TITLE: Record<Profile_Role_Enum, string> = {
  [Profile_Role_Enum.Admin]: "Admin",
  [Profile_Role_Enum.Member]: "Member",
  [Profile_Role_Enum.MemberWhoCanList]: "Listed Member",
  [Profile_Role_Enum.Banned]: "Banned",
};

export const ROLE_SELECT_OPTIONS = Object.values(Profile_Role_Enum).map(
  (role) => {
    return {
      label: MAP_ROLE_TO_TITLE[role],
      value: role,
    };
  }
);
