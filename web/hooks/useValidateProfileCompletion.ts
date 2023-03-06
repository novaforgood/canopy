import { useCallback, useMemo } from "react";

import { useClient } from "urql";

import {
  AllProfilesOfUserQuery,
  AllProfilesOfUserQueryVariables,
  AllProfilesOfUserDocument,
} from "../generated/graphql";

import { useCurrentProfile } from "./useCurrentProfile";
import { useCurrentSpace } from "./useCurrentSpace";
import { useUserData } from "./useUserData";

/**
 * This hook is used to validate that a profile is complete.
 * It is used in the publish profile button.
 */

export function useValidateProfileCompletion() {
  const client = useClient();
  const { userData } = useUserData();
  const { currentProfile } = useCurrentProfile();
  const { currentSpace } = useCurrentSpace();

  const validateProfileCompletion: () => Promise<
    | {
        valid: true;
      }
    | {
        valid: false;
        error: string;
      }
  > = useCallback(async () => {
    if (!currentProfile) {
      throw new Error("No current profile");
    }

    const { data } = await client
      .query<AllProfilesOfUserQuery, AllProfilesOfUserQueryVariables>(
        AllProfilesOfUserDocument,
        { user_id: userData?.id ?? "" }
      )
      .toPromise();
    const myProfile = data?.profile.find((p) => p.id === currentProfile.id);
    if (!myProfile) {
      throw new Error("No profile found");
    }
    if (!myProfile.profile_listing?.headline) {
      return {
        valid: false,
        error: "Please set a headline before publishing your profile",
      };
    }
    if (!myProfile.profile_listing?.profile_listing_image?.image) {
      return {
        valid: false,
        error: "Please set a profile image before publishing your profile",
      };
    }

    const questions = currentSpace?.space_listing_questions.filter(
      (q) => q.deleted === false
    );

    for (const question of questions ?? []) {
      const answer = myProfile.profile_listing?.profile_listing_responses.find(
        (r) => r.space_listing_question.id === question.id
      );

      if (!answer?.response_html || answer?.response_html === "<p></p>") {
        return {
          valid: false,
          error: `Please answer the question "${question.title}" before publishing your profile`,
        };
      }
    }

    return { valid: true };
  }, [
    client,
    currentProfile,
    currentSpace?.space_listing_questions,
    userData?.id,
  ]);

  return useMemo(
    () => ({
      validateProfileCompletion,
    }),
    [validateProfileCompletion]
  );
}
