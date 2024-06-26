export type ProfileAttributes = {
  enableChatIntros: boolean;
  agreedToCommunityGuidelines: boolean;
};
export const DEFAULT_PROFILE_ATTRIBUTES: ProfileAttributes = {
  enableChatIntros: false,
  agreedToCommunityGuidelines: false,
};

export function resolveProfileAttributes(attrs: Partial<ProfileAttributes>) {
  return {
    ...DEFAULT_PROFILE_ATTRIBUTES,
    ...attrs,
  };
}
