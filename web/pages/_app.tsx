import { ReactNode, Suspense, useCallback, useEffect, useMemo } from "react";

import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { useClient } from "urql";

import { Footer } from "../components/Footer";
import { Metadata } from "../components/Metadata";
import { CatchUnsavedChanges } from "../components/singletons/CatchUnsavedChanges";
import {
  useAllChatRoomsSubscription,
  useAnnouncementsBySpaceIdQuery,
  useSpaceBySlugQuery,
} from "../generated/graphql";
import { useLastActiveTracker } from "../hooks/analytics/useLastActiveTracker";
import { useCurrentProfile } from "../hooks/useCurrentProfile";
import { useCurrentSpace } from "../hooks/useCurrentSpace";
import { usePrevious } from "../hooks/usePrevious";
import { useQueryParam } from "../hooks/useQueryParam";
import { useRefreshSession } from "../hooks/useRefreshSession";
import { getCurrentUser, signOut } from "../lib/firebase";
import {
  adminBypassAtom,
  announcementNotificationsCountAtom,
  notificationsCountAtom,
  searchQueryAtom,
  selectedTagIdsAtom,
  sessionAtom,
} from "../lib/jotai";
import { LocalStorage, LocalStorageKey } from "../lib/localStorage";
import { AuthProvider } from "../providers/AuthProvider";
import { UrqlProvider } from "../providers/UrqlProvider";
import { CustomPage } from "../types";

import type { AppProps } from "next/app";

import "../styles/globals.css";
import { ArchivedModal } from "../components/ArchivedModal";

type CustomAppProps = AppProps & {
  Component: CustomPage;
};

function useNumberOfNotifications() {
  const { currentProfile } = useCurrentProfile();
  const [{ data, fetching, error }] = useAllChatRoomsSubscription({
    variables: { profile_id: currentProfile?.id ?? "" },
    pause: !currentProfile,
  });

  const numUnreadMessages = useMemo(
    () =>
      data?.chat_room.reduce((acc, room) => {
        const myProfileEntry = room.profile_to_chat_rooms.find(
          (entry) => entry.profile.id === currentProfile?.id
        );
        if (!myProfileEntry) return acc;
        const latestMessage = room.latest_chat_message[0];
        if (!latestMessage) return acc;

        const shouldNotHighlight =
          // Latest message was sent by me
          latestMessage.sender_profile_id === myProfileEntry.profile.id ||
          // Latest message sent by the other guy was read
          (myProfileEntry.latest_read_chat_message_id &&
            latestMessage.id <= myProfileEntry.latest_read_chat_message_id);

        if (shouldNotHighlight) {
          return acc;
        } else {
          return acc + 1;
        }
      }, 0),
    [data, currentProfile?.id]
  );

  const [_, setNotificationsCount] = useAtom(notificationsCountAtom);
  useEffect(() => {
    setNotificationsCount(numUnreadMessages ?? 0);
  }, [numUnreadMessages, setNotificationsCount]);
}

function useNumberOfAnnouncementNotifications() {
  const { currentSpace } = useCurrentSpace();
  const { currentProfile } = useCurrentProfile();

  const [{ data }] = useAnnouncementsBySpaceIdQuery({
    variables: { space_id: currentSpace?.id ?? "" },
    pause: !currentSpace,
  });

  const numUnreadAnnouncements = useMemo(
    () =>
      data?.announcement.filter(
        (e) =>
          currentProfile?.last_read_announcement_id &&
          e.id > currentProfile?.last_read_announcement_id
      )?.length,
    [data, currentProfile?.last_read_announcement_id]
  );

  const [_, setAnnouncementNotificationsCount] = useAtom(
    announcementNotificationsCountAtom
  );
  useEffect(() => {
    setAnnouncementNotificationsCount(numUnreadAnnouncements ?? 0);
  }, [numUnreadAnnouncements, setAnnouncementNotificationsCount]);
}

function App({ Component, pageProps }: CustomAppProps) {
  useNumberOfNotifications();
  useNumberOfAnnouncementNotifications();
  useLastActiveTracker();

  const { refreshSession } = useRefreshSession();

  ///// Force update JWT if it will expire in 3 minutes /////
  const refreshSessionIfNeeded = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const token = await currentUser.getIdTokenResult();
      const expiresAt = new Date(token.expirationTime).getTime();
      const expiresIn = expiresAt - Date.now();

      // const expireThreshold = 3590000; // For debugging
      const expireThreshold = 180000;

      if (expiresIn < expireThreshold) {
        console.log("Force updating JWT since it expires in 3 minutes...");
        refreshSession({
          forceUpdateJwt: true,
        });
      }
    }
  }, [refreshSession]);

  useEffect(() => {
    const interval = setInterval(refreshSessionIfNeeded, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [refreshSessionIfNeeded]);

  ///// Force update JWT if user changed space /////
  const [session, setSession] = useAtom(sessionAtom);
  const spaceSlug = useQueryParam("slug", "string");

  const [{ data: spaceData }, executeQuery] = useSpaceBySlugQuery({
    pause: true,
    variables: { slug: spaceSlug ?? "" },
  });
  const previousSlug = usePrevious(spaceSlug);
  useEffect(() => {
    // Update space data when slug changes to a non-empty string.
    if (spaceSlug && spaceSlug !== previousSlug) {
      console.log("Re-executing space lazy query...");
      executeQuery();
    }
  }, [spaceSlug, executeQuery, previousSlug]);
  const spaceId = spaceData?.space[0]?.id;

  useEffect(() => {
    const attemptRefreshJwt = async () => {
      const idToken = await getCurrentUser()?.getIdTokenResult();
      if (!idToken) {
        signOut();
        return;
      }

      const claimsSpaceId = (
        idToken.claims["https://hasura.io/jwt/claims"] as {
          ["x-hasura-space-id"]: string;
        }
      )["x-hasura-space-id"];

      if (spaceId === claimsSpaceId) {
        return;
      } else {
        if (spaceId) {
          console.log("Refreshing JWT due to spaceId change...");
          refreshSession({ forceUpdateJwt: true, spaceId: spaceId });
        }
      }
    };
    attemptRefreshJwt();
  }, [spaceId, setSession, refreshSession]);

  // On space slug change
  const [, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [, setSearchQuery] = useAtom(searchQueryAtom);
  const [, setAdminBypass] = useAtom(adminBypassAtom);
  const onSpaceSlugChange = useCallback(() => {
    setSelectedTagIds({});
    setSearchQuery("");
    setAdminBypass(false);
  }, [setAdminBypass, setSearchQuery, setSelectedTagIds]);
  useEffect(() => {
    onSpaceSlugChange();
  }, [spaceSlug, onSpaceSlugChange]);

  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatchUnsavedChanges />
      <Toaster />
      <Metadata />
      {getLayout(<Component {...pageProps} />)}
      {Component.showFooter !== false && <Footer />}
      <ArchivedModal />
    </Suspense>
  );
}

function AppWrapper({ Component, ...pageProps }: CustomAppProps) {
  return (
    <AuthProvider requiredAuthorizations={Component.requiredAuthorizations}>
      <UrqlProvider>
        <App {...pageProps} Component={Component} />
      </UrqlProvider>
    </AuthProvider>
  );
}

export default AppWrapper;
