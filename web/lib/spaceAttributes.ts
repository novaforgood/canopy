export type SpaceAttributes = {
  public: boolean;
  allowOnlyPublicMembersToViewProfiles: boolean;
  domainWhitelists: string[] | null;
  communityGuidelinesUrl: string | null;
  optUsersInToMatchesByDefault: boolean;
};
export const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
  allowOnlyPublicMembersToViewProfiles: false,
  domainWhitelists: null,
  communityGuidelinesUrl: null,
  optUsersInToMatchesByDefault: false,
};
