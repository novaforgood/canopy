import { z } from "zod";

import { executeEmailsBySpaceIdQuery } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

// TEMPORARY
import sendgridMail from "@sendgrid/mail";
import { requireServerEnv } from "../../../server/env";
const SENDGRID_API_KEY = requireServerEnv("SENDGRID_API_KEY");
sendgridMail.setApiKey(SENDGRID_API_KEY);

// TODO - is type necessary?
//   - either this endpoint does a single thing and no type,
//   - or this end point handles multiple request types

const announcementEmailSchema = z.object({
  type: z.literal("ANNOUNCEMENT"), // oops

  // will be less scuffed once we make announcement creation part of the endpoint
  payload: z.object({
    space_id: z.string(),
    space_name: z.string(),
    announcement_data: z.object({
      timeCreated: z.string(),
      contentHTML: z.string(),
      author: z.object({
        first_name: z.string(),
        last_name: z.string(),
        profile_img_url: z.string(),
      }),
    }),
  }),
});

export default applyMiddleware({
  authenticated: true,
  validationSchema: announcementEmailSchema,
}).post(async (req, res) => {
  switch (req.body.type) {
    case "ANNOUNCEMENT": {
      // unpack request payload
      console.log(req.body.payload);
      const { space_id, space_name, announcement_data } = req.body.payload;

      // get email list
      // TODO: catch errors
      const { data: queryData } = await executeEmailsBySpaceIdQuery({
        _space_id: space_id,
        _user_attr_filter: { disableEmailNotifications: true },
      });
      const emails = queryData?.profile.map((profile) => profile.user.email);
      console.log(emails);

      // send the email
      // TODO: move sendgrid logic to sendgrid.ts or smth
      sendgridMail.sendMultiple({
        from: {
          email: "connect@joincanopy.org",
          name: "Canopy",
        },
        to: emails,
        // TODO: CC the post author (?)

        // hardcoded template id
        templateId: "d-c1a1693599d94a36bbd85ca74af10cf3",
        dynamicTemplateData: {
          space_name,
          ...announcement_data,
        },
      });

      break;
    }
  }

  const response = makeApiSuccess({ detail: "E-mail sent!" });
  res.status(response.code).json(response);
});
