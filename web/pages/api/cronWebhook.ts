// Universal webhook handler endpoint
import { z } from "zod";

import { makeListSentence } from "../../common/lib/words";
import { requireServerEnv } from "../../server/env";
import { executeGetUnreadMessagesCountsQuery } from "../../server/generated/serverGraphql";
import { applyMiddleware } from "../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../server/response";
import { sendEmail, SendgridProfile, TemplateId } from "../../server/sendgrid";

const CRON_CLIENT_KEY = requireServerEnv("CRON_CLIENT_KEY");
const HOST_URL = requireServerEnv("HOST_URL");
const MOBILE_APP_SCHEME = requireServerEnv("MOBILE_APP_SCHEME");

enum WebhookType {
  CronJob = "CronJob",
}

enum CronJobType {
  SendChatMessageNotification = "SendChatMessageNotification",
}

const cronSchema = z.object({
  payload: z.object({
    cronJobType: z.literal(CronJobType.SendChatMessageNotification),
  }),
});

export default applyMiddleware({
  authenticated: false,
  validationSchema: cronSchema,
}).post(async (req, res) => {
  const cronClientKey = req.headers["x-canopy-cron-client-key"];
  if (cronClientKey !== CRON_CLIENT_KEY) {
    throw makeApiFail("Invalid cron client key");
  }

  await handleCronJob(req.body.payload.cronJobType);

  const response = makeApiSuccess({ detail: "Success" });
  res.status(response.code).json(response);
});

const PLACEHOLDER_IMAGE_URL = `https://canopy-prod.s3.us-west-2.amazonaws.com/placeholder_profile_pic.jpg`;

async function handleCronJob(cronJobType: CronJobType) {
  switch (cronJobType) {
    case CronJobType.SendChatMessageNotification: {
      const { data, error } = await executeGetUnreadMessagesCountsQuery({});
      if (error) {
        throw makeApiError(error.message);
      }

      const recipientProfiles = data?.profile.filter(
        (profile) => !!profile.user // Filter out profiles without users
      );

      const promises =
        recipientProfiles?.map((recipientProfile) => {
          const totalUnreadMessagesCount =
            recipientProfile.unread_messages_counts.reduce(
              (acc, curr) => acc + curr.unread_messages_count,
              0
            );
          return sendEmail({
            receiverProfileId: recipientProfile.id,
            templateId: TemplateId.DailyChatMessageNotification,
            dynamicTemplateData: ({ space }) => {
              const senderProfiles: SendgridProfile[] =
                recipientProfile.unread_messages_counts
                  .filter((item) => !!item.sender_profile?.user) // Filter out profiles without users
                  .map((item) => {
                    return {
                      firstName: item.sender_profile?.user?.first_name ?? "",
                      lastName: item.sender_profile?.user?.last_name ?? "",
                      profilePicUrl:
                        item.sender_profile?.profile_listing
                          ?.profile_listing_image?.image.url ??
                        PLACEHOLDER_IMAGE_URL,
                      email: item.sender_profile?.user?.email ?? "",
                      headline:
                        item.sender_profile?.profile_listing?.headline ?? "",
                    };
                  });

              // Concat first names into list sentence (e.g. "NameA, NameB, and NameC")
              const firstNames = senderProfiles.map((item) => item.firstName);
              const firstNamesSentence = makeListSentence(firstNames);
              return {
                viewChatsUrl: `${HOST_URL}/go/${MOBILE_APP_SCHEME}/space/${space.slug}/chat`,
                totalUnreadMessagesCount,
                senderProfiles: senderProfiles,
                messagesSenders: firstNamesSentence,
              };
            },
          });
        }) ?? [];

      await Promise.all(promises).catch((err) => {
        console.error(err);
      });

      return;
    }
  }
}
