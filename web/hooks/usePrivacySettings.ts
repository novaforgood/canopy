import { useMemo } from "react";

import {
  DEFAULT_SPACE_ATTRIBUTES,
  SpaceAttributes,
} from "./../lib/spaceAttributes";
import { useCurrentSpace } from "./useCurrentSpace";

export type PrivacySettings = Pick<
  SpaceAttributes,
  | "public"
  | "allowOnlyPublicMembersToViewProfiles"
  | "optUsersInToMatchesByDefault"
>;

export function usePrivacySettings(): {
  privacySettings: PrivacySettings | undefined;
} {
  const { currentSpace } = useCurrentSpace();

  const settings: PrivacySettings | undefined = useMemo(() => {
    if (!currentSpace) return undefined;

    return {
      public: DEFAULT_SPACE_ATTRIBUTES.public,
      allowOnlyPublicMembersToViewProfiles:
        DEFAULT_SPACE_ATTRIBUTES.allowOnlyPublicMembersToViewProfiles,
      domainWhitelist: DEFAULT_SPACE_ATTRIBUTES.domainWhitelist,
      ...currentSpace.attributes,
    };
  }, [currentSpace]);

  return useMemo(
    () => ({
      privacySettings: settings,
    }),
    [settings]
  );
}
