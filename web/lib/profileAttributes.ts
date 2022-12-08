export type ProfileAttributes = {
  enableMatching: boolean;
};
const DEFAULT_PROFILE_ATTRIBUTES: ProfileAttributes = {
  enableMatching: false,
};

export function resolveProfileAttributes(attrs: Partial<ProfileAttributes>) {
  return {
    ...DEFAULT_PROFILE_ATTRIBUTES,
    ...attrs,
  };
}
