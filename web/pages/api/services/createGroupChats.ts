import { z } from "zod";

import { makeListSentence } from "../../../common/lib/words";
import { requireServerEnv } from "../../../server/env";
import {
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
  const { groupSize } = req.body;

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

  // At this point, we have decided to proceed with creating the group chats.
  const profileGroups = groupIntoGroupsOfN(allProfiles, groupSize);
  console.log("Grouped profiles");

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
              )},\n\nYou have been matched into a group! Feel free to introduce yourselves and respond to the conversation starter below:\n\n${conversationStarter}`,
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
        console.log("Sent email to", profile.user?.email);
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
