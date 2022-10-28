import { useMemo } from "react";

import {
  DEFAULT_SPACE_ATTRIBUTES,
  SpaceAttributes,
} from "./../lib/spaceAttributes";
import { useCurrentSpace } from "./useCurrentSpace";

export type PrivacySettings = Pick<
  SpaceAttributes,
  "public" | "allowOnlyPublicMembersToViewProfiles"
>;

export function usePrivacySettings(): PrivacySettings | undefined {
  const { currentSpace } = useCurrentSpace();

  const settings: PrivacySettings | undefined = useMemo(() => {
    if (!currentSpace) return undefined;

    return {
      public: DEFAULT_SPACE_ATTRIBUTES.public,
      allowOnlyPublicMembersToViewProfiles:
        DEFAULT_SPACE_ATTRIBUTES.allowOnlyPublicMembersToViewProfiles,
      ...currentSpace.attributes,
    };
  }, [currentSpace]);

  return settings;
}
