export type SpaceAttributes = {
  public: boolean;
  allowOnlyPublicMembersToViewProfiles: boolean;
  domainWhitelist: string | null;
};
export const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
  allowOnlyPublicMembersToViewProfiles: false,
  domainWhitelist: null,
};
