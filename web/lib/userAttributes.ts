export type UserAttributes = {
  disableEmailNotifications: boolean;
};
const DEFAULT_USER_ATTRIBUTES: UserAttributes = {
  disableEmailNotifications: false,
};

export function resolveUserAttributes(attrs: Partial<UserAttributes>) {
  return {
    ...DEFAULT_USER_ATTRIBUTES,
    ...attrs,
  };
}
