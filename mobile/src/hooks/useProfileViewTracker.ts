import { useCallback, useMemo } from "react";

import { useInsertProfileViewEventMutation } from "../generated/graphql";
import { SecureStore, SecureStoreKey } from "../lib/secureStore";

/**
 * Backend only accepts one instance of [viewerProfileId, viewedProfileId] per 15 minutes
 *
 * Since SecureStore is cleared on logout, we only need to track viewedProfileId (viewerProfileId is consistent in a session)
 */

// Amount of time to wait before sending a repeat event
// (Sending before 15 mins will result in rejection anyways, so we avoid spamming the backend)
const PAGE_VIEW_COOLDOWN = 1000 * 60 * 15; // 15 minutes (backend only accepts 1 identical event per 15 minutes)

// This only happens if the SecureStore is somehow cleared--backend check will say event sent is too soon
// Cooldown can be under 15 minutes so we will retry in 5 minutes
const PAGE_VIEW_TOO_SOON_COOLDOWN = 1000 * 60 * 5;

// If an unexpected error occurs, we will retry in 2 minutes
const PAGE_VIEW_ERROR_COOLDOWN = 1000 * 60 * 2; // 2 minutes (rate limit)

async function shouldTrackView(viewedProfileId: string) {
  const nextTrackTimes = ((await SecureStore.get(
    SecureStoreKey.ProfileLastViewedCooldown
  )) || {}) as Record<string, number>;

  if (
    nextTrackTimes[viewedProfileId] &&
    Date.now() < nextTrackTimes[viewedProfileId]
  ) {
    // console.log(
    //   nextTrackTimes[viewedProfileId] - Date.now(),
    //   "ms until next tracking event"
    // );
    // Don't track if we've already tracked a view PAGE_VIEW_COOLDOWN ago
    return false;
  }

  return true;
}

async function markTrackingAttempt(viewedProfileId: string, cooldown: number) {
  const nextTrackTimes = ((await SecureStore.get(
    SecureStoreKey.ProfileLastViewedCooldown
  )) || {}) as Record<string, number>;

  nextTrackTimes[viewedProfileId] = Date.now() + cooldown;
  SecureStore.set(SecureStoreKey.ProfileLastViewedCooldown, nextTrackTimes);
}

export function useProfileViewTracker() {
  const [_, insertProfileViewEvent] = useInsertProfileViewEventMutation();

  const attemptTrackView = useCallback(
    async (viewedProfileId: string, viewerProfileId: string) => {
      if (!viewerProfileId || !viewedProfileId) return;

      const shouldTrack = await shouldTrackView(viewedProfileId);
      if (!shouldTrack) return;

      console.log("Should track!");

      return insertProfileViewEvent({
        viewed_profile_id: viewedProfileId,
        viewer_profile_id: viewerProfileId,
      }).then((res) => {
        if (res.error) {
          if (res.error.message.includes("15 minutes")) {
            return markTrackingAttempt(
              viewedProfileId,
              PAGE_VIEW_TOO_SOON_COOLDOWN
            );
          } else {
            return markTrackingAttempt(
              viewedProfileId,
              PAGE_VIEW_ERROR_COOLDOWN
            );
          }
        } else {
          return markTrackingAttempt(viewedProfileId, PAGE_VIEW_COOLDOWN);
        }
      });
    },
    [insertProfileViewEvent]
  );

  return useMemo(() => {
    return {
      attemptTrackView,
    };
  }, [attemptTrackView]);
}
