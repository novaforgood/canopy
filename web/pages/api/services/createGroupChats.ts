import { z } from "zod";

import { makeListSentence } from "../../../common/lib/words";
import { requireServerEnv } from "../../../server/env";
import {
  executeGetPreviousPairingsQuery,
  executeGetProfilesQuery,
  executeInsertChatIntroMutation,
  executeInsertChatRoomOneMutation,
  executeInsertProfileMutation,
  Profile_Constraint,
  Profile_Role_Enum,
  Profile_To_Profile_Role_Constraint,
  Profile_To_Profile_Role_Update_Column,
  Profile_Update_Column,
  User_Type_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";
import { sendEmail, TemplateId } from "../../../server/sendgrid";

const HOST_URL = requireServerEnv("HOST_URL");
const MOBILE_APP_SCHEME = requireServerEnv("MOBILE_APP_SCHEME");

const CONVERSATION_STARTERS = [
  "If you had to give a TED talk, what topic would it be on?",
  "What is your favorite TV show?",
  "If you could host a talk show, who would you have on first?",
  "What's your favorite movie?",
  "Where do you want to travel next?",
  "What hobby do you wish you had more time for?",
  "What's something most people couldn't tell about you?",
  "What's something people would be surprised to learn about you?",
  "If you could live anywhere in the world, where would it be?",
  "What is the weirdest thing you are afraid of?",
  "What is the most ridiculous fact you know?",
  "What is the best purchase you have made?",
  "What is the worst purchase you have made?",
  "If you could be any celebrity for a day, who would you be?",
  "What is a funny thing you believed when you were younger?",
  "If you could have dinner with anyone, dead or alive, who would they be?",
  "If you could only eat from one restaurant for the rest of your life, what would it be?",
  "What is something you think is overrated?",
  "What was your dream job as a kid?",
  "What is the most underrated food combination?",
  "What are people not grateful enough for?",
  "What is the most useless talent you have?",
];

const createGroupChatsSchema = z.object({
  groupSize: z.number().min(2).max(5),
  allowRepeats: z.boolean().optional().default(false),
});

enum ChatBotIds {
  CanopyBot = "bot-BAZe9r-canopybot",
}

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: true,
  authorizationsInSpace: [Profile_Role_Enum.Admin],
  validationSchema: createGroupChatsSchema,
}).post(async (req, res) => {
  const { callerProfile } = req;

  if (!callerProfile) {
    throw makeApiFail("Missing caller profile");
  }

  const spaceId = callerProfile.space.id;
  const { groupSize, allowRepeats = false } = req.body;

  if (!spaceId) {
    throw makeApiFail("Missing spaceId in headers");
  }

  // Upsert chat bot profile in space if doesn't exist
  const canopyBotProfileId = await upsertChatBotProfile(spaceId);

  // Get all available profiles
  const { error: profilesError, data: profilesData } =
    await executeGetProfilesQuery({
      where: {
        space_id: { _eq: spaceId },
        attributes: {
          _contains: {
            enableChatIntros: true,
          },
        },
        flattened_profile_roles: {
          profile_role: {
            _eq: Profile_Role_Enum.Member,
          },
        },
        user: {
          type: { _eq: User_Type_Enum.User },
        },
      },
    });
  if (profilesError || !profilesData?.profile) {
    throw makeApiError(profilesError?.message ?? "Profiles query error");
  }
  console.log("Got profiles");
  const allProfiles = profilesData.profile.filter((profile) => !!profile.user);

  if (allProfiles.length < groupSize) {
    throw makeApiFail(
      `Need at least ${groupSize} available members to create groups of size ${groupSize}`
    );
  }

  // Get previous pairings to avoid repeats
  const previousPairings: Set<string> = new Set();
  if (!allowRepeats) {
    const { data: pairingsData, error: pairingsError } =
      await executeGetPreviousPairingsQuery({
        space_id: spaceId,
      });

    if (pairingsError) {
      console.error("Error fetching previous pairings:", pairingsError);
    } else if (pairingsData?.chat_room) {
      // Build set of previous pairings
      for (const room of pairingsData.chat_room) {
        const profileIds = room.profile_to_chat_rooms
          .map((p) => p.profile_id)
          .filter((id): id is string => id !== canopyBotProfileId)
          .sort();

        // Create pair keys for all combinations in this room
        for (let i = 0; i < profileIds.length; i++) {
          for (let j = i + 1; j < profileIds.length; j++) {
            const pairKey = `${profileIds[i]},${profileIds[j]}`;
            previousPairings.add(pairKey);
          }
        }
      }
    }
    console.log(`Found ${previousPairings.size} previous pairings`);
  }

  // At this point, we have decided to proceed with creating the group chats.
  let profileGroups: typeof allProfiles[] = [];

  if (allowRepeats || previousPairings.size === 0) {
    // Use simple random grouping if allowing repeats or no history
    profileGroups = groupIntoGroupsOfN(allProfiles, groupSize);
    console.log("Grouped profiles (random)");
  } else {
    // Use greedy algorithm with constraint checking
    const result = await createGroupsWithConstraints(
      allProfiles,
      groupSize,
      previousPairings,
      5000
    );

    if (!result.success) {
      throw makeApiFail(
        "Unable to create groups without repeating previous pairings. " +
          "Try enabling 'Allow repeat pairings' option."
      );
    }

    profileGroups = result.groups;
    console.log("Grouped profiles (constraint-based)");
  }

  const { data: chatIntroData, error: insertChatIntroError } =
    await executeInsertChatIntroMutation({
      data: {
        group_size: groupSize,
        space_id: spaceId,
        creator_profile_id: callerProfile.id,
        num_groups_created: profileGroups.length,
        num_people_matched: allProfiles.length,
      },
    });
  if (insertChatIntroError) {
    throw makeApiError(insertChatIntroError.message);
  }
  const chatIntroId = chatIntroData?.insert_chat_intro_one?.id;
  if (!chatIntroId) {
    throw makeApiFail("No chat intro ID returned");
  }
  console.log("Added chat intro to DB");

  const emailPromises: Promise<void>[] = [];
  const promises = profileGroups.map(async (group) => {
    const names = group.map((profile) => `${profile.user?.first_name}`);
    const conversationStarter =
      CONVERSATION_STARTERS[
        Math.floor(Math.random() * CONVERSATION_STARTERS.length)
      ];

    const { error, data } = await executeInsertChatRoomOneMutation({
      data: {
        chat_messages: {
          data: [
            {
              text: `Hello ${makeListSentence(
                names
              )},\n\nYou have been matched into a group! Next steps:\n\n1. Introduce yourselves! Feel free to start by answering the following: ${conversationStarter}\n2. Suggest some times to meet up! This can be in person or over a video call.`,
              sender_profile_id: canopyBotProfileId,
            },
          ],
        },
        chat_intro_id: chatIntroId,
        profile_to_chat_rooms: {
          data: [
            { profile_id: canopyBotProfileId },
            ...group.map((profile) => ({ profile_id: profile.id })),
          ],
        },
      },
    });

    if (error) {
      throw makeApiError(error.message);
    }

    console.log("Created chat room for group:", data?.insert_chat_room_one?.id);

    // Send email to each user in the group
    group.forEach((profile) => {
      const otherMembers = group.filter((p) => p.id !== profile.id);
      const otherMemberNames = makeListSentence(
        otherMembers.map((p) => `${p.user?.first_name}`)
      );

      const emailPromise = sendEmail({
        templateId: TemplateId.ChatIntroNotification,
        receiverProfileId: profile.id,
        dynamicTemplateData({ space }) {
          return {
            groupMemberNames: otherMemberNames,
            groupMemberProfiles: otherMembers.map((p) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const user = p.user; // Guaranteed to exist by the query
              return {
                firstName: user?.first_name ?? "",
                lastName: user?.last_name ?? "",
                email: user?.email ?? "",
                headline: p.profile_listing?.headline ?? "",
                profilePicUrl:
                  p.profile_listing?.profile_listing_image?.image.url ?? "",
              };
            }),

            viewGroupChatUrl: `${HOST_URL}/go/${MOBILE_APP_SCHEME}/space/${space.slug}/chat/${data?.insert_chat_room_one?.id}`,
          };
        },
      }).then((result) => {
        // console.log("Sent email to", profile.user?.email);
      });

      emailPromises.push(emailPromise);
    });

    return;
  });

  await Promise.all(promises);
  await Promise.all(emailPromises).catch((error) => {
    console.error("Error sending email", error);
  });

  const response = makeApiSuccess({ detail: "Success" });
  res.status(response.code).json(response);
});

async function upsertChatBotProfile(spaceId: string) {
  const { error: insertBotError, data: insertBotData } =
    await executeInsertProfileMutation({
      data: {
        space_id: spaceId,
        user_id: ChatBotIds.CanopyBot,
        profile_roles: {
          data: [{ profile_role: Profile_Role_Enum.Member }],
          on_conflict: {
            constraint:
              Profile_To_Profile_Role_Constraint.ProfilesProfileRolesProfileIdProfileRoleKey,
            update_columns: [Profile_To_Profile_Role_Update_Column.ProfileRole],
          },
        },
      },
      on_conflict: {
        constraint: Profile_Constraint.ProfileUserIdSpaceIdKey,
        update_columns: [Profile_Update_Column.UserId],
      },
    });
  if (insertBotError || !insertBotData?.insert_profile_one) {
    throw makeApiError(insertBotError?.message ?? "Chat bot insertion error");
  }
  const canopyBotProfileId = insertBotData.insert_profile_one.id;
  return canopyBotProfileId;
}

function groupIntoGroupsOfN<T>(arr: T[], n: number): T[][] {
  const shuffled = arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const groups = [];
  for (let i = 0; i < shuffled.length; i += n) {
    groups.push(shuffled.slice(i, i + n));
  }

  if (groups.length > 1 && groups[groups.length - 1].length < n) {
    const lastGroup = groups.pop();
    if (lastGroup) {
      for (let i = 0; i < lastGroup.length; i++) {
        const relocationIndex = i % groups.length;
        groups[relocationIndex].push(lastGroup[i]);
      }
    }
  }

  return groups;
}

/**
 * Creates groups while avoiding previous pairings using a greedy algorithm with backtracking
 */
async function createGroupsWithConstraints<T extends { id: string }>(
  profiles: T[],
  groupSize: number,
  previousPairings: Set<string>,
  timeoutMs: number
): Promise<{ success: boolean; groups: T[][] }> {
  const startTime = Date.now();
  const groups: T[][] = [];
  const usedProfiles = new Set<string>();

  // Helper function to check if two profiles can be paired
  const canPair = (profile1Id: string, profile2Id: string): boolean => {
    const pairKey = [profile1Id, profile2Id].sort().join(",");
    return !previousPairings.has(pairKey);
  };

  // Helper function to check if a profile can join a group
  const canJoinGroup = (profileId: string, group: T[]): boolean => {
    for (const member of group) {
      if (!canPair(profileId, member.id)) {
        return false;
      }
    }
    return true;
  };

  // Shuffle profiles for randomness
  const shuffled = [...profiles].sort(() => Math.random() - 0.5);

  // Try to create groups greedily with backtracking
  const tryCreateGroups = (): boolean => {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      return false;
    }

    // If all profiles are used, we're done
    const remainingProfiles = shuffled.filter((p) => !usedProfiles.has(p.id));
    if (remainingProfiles.length === 0) {
      return true;
    }

    // If we can't form a complete group with remaining profiles, redistribute
    if (remainingProfiles.length < groupSize) {
      // Try to redistribute remaining profiles to existing groups
      for (const profile of remainingProfiles) {
        let placed = false;
        for (const group of groups) {
          if (group.length < groupSize + 1 && canJoinGroup(profile.id, group)) {
            group.push(profile);
            usedProfiles.add(profile.id);
            placed = true;
            break;
          }
        }
        if (!placed) {
          // If we can't place this profile anywhere, backtrack
          return false;
        }
      }
      return true;
    }

    // Try to form a new group
    const currentGroup: T[] = [];
    const candidateProfiles = [...remainingProfiles];

    // Start with the first available profile
    const firstProfile = candidateProfiles.shift();
    if (!firstProfile) {
      return false;
    }
    currentGroup.push(firstProfile);
    usedProfiles.add(firstProfile.id);

    // Try to fill the group
    for (let i = 1; i < groupSize; i++) {
      let found = false;

      for (let j = 0; j < candidateProfiles.length; j++) {
        const candidate = candidateProfiles[j];
        if (
          !usedProfiles.has(candidate.id) &&
          canJoinGroup(candidate.id, currentGroup)
        ) {
          currentGroup.push(candidate);
          usedProfiles.add(candidate.id);
          candidateProfiles.splice(j, 1);
          found = true;
          break;
        }
      }

      if (!found) {
        // Couldn't complete this group, backtrack
        for (const member of currentGroup) {
          usedProfiles.delete(member.id);
        }
        return false;
      }
    }

    // Successfully created a group
    groups.push(currentGroup);

    // Recursively try to create more groups
    if (tryCreateGroups()) {
      return true;
    }

    // Backtrack if recursive call failed
    groups.pop();
    for (const member of currentGroup) {
      usedProfiles.delete(member.id);
    }
    return false;
  };

  // Try multiple times with different shuffles
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - startTime > timeoutMs) {
      break;
    }

    // Reset state
    groups.length = 0;
    usedProfiles.clear();

    // Reshuffle for different starting configuration
    shuffled.sort(() => Math.random() - 0.5);

    if (tryCreateGroups()) {
      return { success: true, groups };
    }
  }

  return { success: false, groups: [] };
}
