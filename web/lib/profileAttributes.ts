export type ProfileAttributes = {
  enableChatIntros: boolean;
};
const DEFAULT_PROFILE_ATTRIBUTES: ProfileAttributes = {
  enableChatIntros: false,
};

export function resolveProfileAttributes(attrs: Partial<ProfileAttributes>) {
  return {
    ...DEFAULT_PROFILE_ATTRIBUTES,
    ...attrs,
  };
}
