export type SpaceAttributes = {
  public: boolean;
  allowOnlyPublicMembersToViewProfiles: boolean;
  domainWhitelist: string | null;
  optUsersInToMatchesByDefault: boolean;
};
export const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
  allowOnlyPublicMembersToViewProfiles: false,
  domainWhitelist: null,
  optUsersInToMatchesByDefault: false,
};
