import { useCallback, useEffect } from "react";

import { useUpdateUserMutation } from "../../generated/graphql";
import { SecureStore, SecureStoreKey } from "../../lib/secureStore";
import { useForegroundEffect } from "../useForegroundEffect";
import { useUserData } from "../useUserData";

export function useLastActiveTracker() {
  const { userData } = useUserData();
  const [_, updateUser] = useUpdateUserMutation();

  // When this hook is loaded, we want to update the last active time
  // of the user. This is done by calling the updateUser mutation
  // with the lastActiveAt field set to the current time.

  // Also, we don't want to spam the backend with requests, so we
  // only update the last active time if it has been more than 5
  // minutes since the last update.

  const attemptTrackLastActive = useCallback(async () => {
    if (!userData) return;

    const lastTimeTrackedRaw = await SecureStore.get(
      SecureStoreKey.LastActiveCooldown
    );

    const lastTimeTracked =
      typeof lastTimeTrackedRaw === "number" ? lastTimeTrackedRaw : undefined;

    const now = Date.now();

    if (!lastTimeTracked || now - lastTimeTracked > 1000 * 60 * 5) {
      await SecureStore.set(SecureStoreKey.LastActiveCooldown, now);
      updateUser({
        id: userData.id,
        changes: {
          last_active_at: new Date().toISOString(),
        },
      });
    }
  }, [updateUser, userData]);

  useEffect(() => {
    attemptTrackLastActive();
  }, [attemptTrackLastActive]);

  useForegroundEffect(() => {
    attemptTrackLastActive();
  });
}
