export function getFullNameOfUser(
  user?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null
) {
  if (!user) {
    return "[Deleted User]";
  } else {
    return `${user.first_name} ${user.last_name}`;
  }
}

export function getFirstNameOfUser(
  user?: {
    first_name?: string | null;
  } | null
) {
  if (!user) {
    return "[Deleted User]";
  } else {
    return user.first_name ?? "";
  }
}

export function getLastNameOfUser(
  user?: {
    last_name?: string | null;
  } | null
) {
  if (!user) {
    return "[Deleted User]";
  } else {
    return user.last_name ?? "";
  }
}
