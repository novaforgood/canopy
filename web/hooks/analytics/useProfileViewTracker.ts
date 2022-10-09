import { useCallback, useMemo } from "react";

import { useInsertProfileViewEventMutation } from "../../generated/graphql";
import { LocalStorage, LocalStorageKey } from "../../lib/localStorage";

// Amount of time to wait before sending a repeat event
const PAGE_VIEW_COOLDOWN = 1000 * 60 * 0.3;

function shouldTrackView(viewedProfileId: string) {
  const lastViewed = (LocalStorage.get(LocalStorageKey.ProfileLastViewed) ||
    {}) as Record<string, number>;

  if (
    lastViewed[viewedProfileId] &&
    Date.now() - lastViewed[viewedProfileId] < PAGE_VIEW_COOLDOWN
  ) {
    console.log(Date.now() - lastViewed[viewedProfileId]);
    // Don't track if we've already tracked a view PAGE_VIEW_COOLDOWN ago
    return false;
  }

  return true;
}

function afterTrackViewAttempt(viewedProfileId: string) {
  const lastViewed = (LocalStorage.get(LocalStorageKey.ProfileLastViewed) ||
    {}) as Record<string, number>;

  lastViewed[viewedProfileId] = Date.now();
  LocalStorage.set(LocalStorageKey.ProfileLastViewed, lastViewed);
}
export function useProfileViewTracker() {
  const [_, insertProfileViewEvent] = useInsertProfileViewEventMutation();

  const attemptTrackView = useCallback(
    (viewedProfileId: string, viewerProfileId: string) => {
      if (!viewerProfileId || !viewedProfileId) return;
      if (!shouldTrackView(viewedProfileId)) return;

      insertProfileViewEvent({
        viewed_profile_id: viewedProfileId,
        viewer_profile_id: viewerProfileId,
      });
      afterTrackViewAttempt(viewedProfileId);
    },
    [insertProfileViewEvent]
  );

  return useMemo(() => {
    return {
      attemptTrackView,
    };
  }, [attemptTrackView]);
}
