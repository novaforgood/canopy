import { z } from "zod";

import { makeListSentence } from "../../../common/lib/words";
import { requireServerEnv } from "../../../server/env";
import {
  executeGetProfilesQuery,
  executeInsertChatIntroMutation,
  executeInsertChatRoomOneMutation,
  executeInsertImageMutation,
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
  groupSize: z.number().min(2).max(3),
});

enum ChatBotIds {
  CanopyBot = "bot-BAZe9r-canopybot",
}

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: createGroupChatsSchema,
}).post(async (req, res) => {
  const { groupSize } = req.body;

  const spaceId =
    req.token["https://hasura.io/jwt/claims"]?.["x-hasura-space-id"];
  if (!spaceId) {
    throw makeApiFail("No space ID found in token");
  }

  // Verify that the user is an admin of the space.
  const { data: callerUserData } = await executeGetProfilesQuery({
    where: {
      space_id: { _eq: spaceId },
      user_id: { _eq: req.token.uid },
    },
  });
  const callerProfile = callerUserData?.profile[0];
  if (!callerProfile) {
    throw makeApiFail("No profile found for caller");
  }
  const roles = callerProfile.flattened_profile_roles.map(
    (item) => item.profile_role
  );
  if (!roles.includes(Profile_Role_Enum.Admin)) {
    throw makeApiFail("Only admins can create group chats");
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
        user: {
          type: { _eq: User_Type_Enum.User },
        },
      },
    });
  if (profilesError || !profilesData?.profile) {
    throw makeApiError(profilesError?.message ?? "Profiles query error");
  }

  const allProfiles = profilesData.profile;
  if (allProfiles.length < groupSize) {
    throw makeApiFail(
      `Need at least ${groupSize} available members to create groups of size ${groupSize}`
    );
  }

  // At this point, we have decided to proceed with creating the group chats.
  const profileGroups = groupIntoGroupsOfN(allProfiles, groupSize);

  const { data: chatIntroData, error: insertChatIntroError } =
    await executeInsertChatIntroMutation({
      data: {
        group_size: groupSize,
        space_id: spaceId,
        creator_profile_id: callerProfile.id,
        num_groups_created: profileGroups.length,
      },
    });
  if (insertChatIntroError) {
    throw makeApiError(insertChatIntroError.message);
  }
  const chatIntroId = chatIntroData?.insert_chat_intro_one?.id;
  if (!chatIntroId) {
    throw makeApiFail("No chat intro ID returned");
  }

  const promises = profileGroups.map((group) => {
    const names = group.map((profile) => `${profile.user.first_name}`);
    const conversationStarter =
      CONVERSATION_STARTERS[
        Math.floor(Math.random() * CONVERSATION_STARTERS.length)
      ];

    return executeInsertChatRoomOneMutation({
      data: {
        chat_messages: {
          data: [
            {
              text: `Hello ${makeListSentence(
                names
              )},\n\nYou have been matched into a group! Feel free to introduce yourselves. Here is a conversation starter if it helps:\n\n${conversationStarter}`,
              sender_profile_id: canopyBotProfileId,
            },
          ],
        },
        attributes: {
          chatIntroId: chatIntroId,
        },
        profile_to_chat_rooms: {
          data: [
            { profile_id: canopyBotProfileId },
            ...group.map((profile) => ({ profile_id: profile.id })),
          ],
        },
      },
    });
  });

  await Promise.all(promises).catch((err) => {
    console.error(err);
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

  // Avoid groups of 1. Dump the last group into the first group.
  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    const lastGroup = groups.pop();
    if (!lastGroup) {
      throw new Error("Last group should exist");
    }
    groups[0].push(lastGroup[0]);
  }

  return groups;
}