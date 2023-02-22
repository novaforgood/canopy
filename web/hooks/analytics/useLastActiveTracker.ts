import { useCallback, useEffect } from "react";

import { useUpdateUserMutation } from "../../generated/graphql";
import { LocalStorageKey, LocalStorage } from "../../lib/localStorage";
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

  // We also want to update the last active time when the user
  // navigates away from the page, so we use the beforeunload event
  // to trigger the update.

  const attemptTrackLastActive = useCallback(() => {
    if (!userData) return;

    const lastTimeTrackedRaw = LocalStorage.get(
      LocalStorageKey.LastActiveCooldown
    );

    const lastTimeTracked =
      typeof lastTimeTrackedRaw === "number" ? lastTimeTrackedRaw : undefined;

    const now = Date.now();

    if (!lastTimeTracked || now - lastTimeTracked > 1000 * 60 * 5) {
      updateUser({
        id: userData.id,
        changes: {
          last_active_at: new Date().toISOString(),
        },
      });
      LocalStorage.set(LocalStorageKey.LastActiveCooldown, now);
    }
  }, [updateUser, userData]);

  useEffect(() => {
    attemptTrackLastActive();
  }, [attemptTrackLastActive]);

  useEffect(() => {
    window.addEventListener("beforeunload", attemptTrackLastActive);
    return () => {
      window.removeEventListener("beforeunload", attemptTrackLastActive);
    };
  }, [attemptTrackLastActive]);
}
