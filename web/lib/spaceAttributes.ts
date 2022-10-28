export type SpaceAttributes = {
  public: boolean;
  allowOnlyPublicMembersToViewProfiles: boolean;
};
export const DEFAULT_SPACE_ATTRIBUTES: SpaceAttributes = {
  public: false,
  allowOnlyPublicMembersToViewProfiles: false,
};
