import sendgridMail from "@sendgrid/mail";
import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import {
  executeEmailsBySpaceIdQuery,
  executeGetProfileQuery,
  executeInsertAnnouncementMutation,
  User_Type_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiError, makeApiSuccess } from "../../../server/response";

const HOST_URL = requireServerEnv("HOST_URL");
const SENDGRID_API_KEY = requireServerEnv("SENDGRID_API_KEY");
sendgridMail.setApiKey(SENDGRID_API_KEY);

const announcementEmailSchema = z.object({
  authorProfileId: z.string(),
  announcementContent: z.string(),
});

export default applyMiddleware({
  authenticated: true,
  validationSchema: announcementEmailSchema,
}).post(async (req, res) => {
  const { authorProfileId, announcementContent } = req.body;

  // get profile data
  const { data: queryData } = await executeGetProfileQuery({
    profile_id: authorProfileId,
  });

  // insert the announcement
  await executeInsertAnnouncementMutation({
    object: {
      space_id: queryData?.profile_by_pk?.space.id,
      author_profile_id: authorProfileId,
      created_at: new Date().toISOString(),
      deleted: false,
      content: announcementContent,
    },
  }).catch((err) => {
    throw makeApiError(`Failed to publish announcement: ${err}`);
  });

  // send emails
  const { space, user, profile_listing } = queryData?.profile_by_pk ?? {};

  const { data: emailQueryData } = await executeEmailsBySpaceIdQuery({
    _space_id: space?.id || "",
    _user_attr_filter: { disableEmailNotifications: true },
  });
  const emails = emailQueryData?.profile
    .filter((profile) => profile.user.type == User_Type_Enum.User)
    .map((profile) => profile.user.email);

  const emailTemplateParams = {
    space_slug: space?.slug,
    space_name: space?.name,
    author_name: `${user?.first_name} ${user?.last_name}`,
    author_headline: profile_listing?.headline,
    author_img_url: profile_listing?.profile_listing_image?.image.url,
    announcement_content: announcementContent,
    view_announcements_url: `${HOST_URL}/space/${space?.slug}/announcements`,
  };

  await sendgridMail
    .sendMultiple({
      from: {
        email: "connect@joincanopy.org",
        name: "Canopy",
      },
      to: emails,

      // hardcoded template id
      templateId: "d-c1a1693599d94a36bbd85ca74af10cf3",
      dynamicTemplateData: emailTemplateParams,
    })
    .catch((err) => {
      throw makeApiError(`Failed to send emails: ${err}`);
    });

  const response = makeApiSuccess({ detail: "Announcement Posted!" });
  res.status(response.code).json(response);
});
