import { useMemo } from "react";

import {
  DEFAULT_SPACE_ATTRIBUTES,
  SpaceAttributes,
} from "../lib/spaceAttributes";
import { useCurrentSpace } from "./useCurrentSpace";

export function useSpaceAttributes(): {
  attributes: SpaceAttributes | undefined;
} {
  const { currentSpace } = useCurrentSpace();

  const settings: SpaceAttributes | undefined = useMemo(() => {
    if (!currentSpace) return undefined;

    return {
      // Pick out only privacy settings defaults
      ...DEFAULT_SPACE_ATTRIBUTES,
      ...currentSpace.attributes,
    };
  }, [currentSpace]);

  return useMemo(
    () => ({
      attributes: settings,
    }),
    [settings]
  );
}
