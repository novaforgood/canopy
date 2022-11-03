import { z } from "zod";

import { EmailType } from "../../../common/types";
import {
  executeGetInviteLinkQuery,
  executeGetProfileQuery,
  executeInsertConnectionRequestMutation,
  executeInsertProfileMutation,
  GetInviteLinkDocument,
  Profile_Role_Enum,
  Space_Invite_Link_Type_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";
import { sendEmail, TemplateId } from "../../../server/sendgrid";

const connectEmailSchema = z.object({
  type: z.literal(EmailType.Connect),
  payload: z.object({
    senderProfileId: z.string(),
    receiverProfileId: z.string(),
    introMessage: z.string().optional(),
    availability: z.string(),
    timezone: z.string(),
  }),
});

export default applyMiddleware({
  authenticated: true,
  validationSchema: connectEmailSchema,
}).post(async (req, res) => {
  switch (req.body.type) {
    case EmailType.Connect: {
      const {
        senderProfileId,
        receiverProfileId,
        introMessage,
        availability,
        timezone,
      } = req.body.payload;

      await sendEmail({
        receiverProfileId: receiverProfileId,
        senderProfileId: senderProfileId,
        templateId: TemplateId.ConnectionRequest,
        dynamicTemplateData: ({ space }) => ({
          introMessage,
          availability,
          timezone,
          spaceName: space.name,
        }),
      }).catch((err: Error) => {
        throw makeApiError(err.message);
      });

      const { error } = await executeInsertConnectionRequestMutation({
        data: {
          sender_profile_id: senderProfileId,
          receiver_profile_id: receiverProfileId,
        },
      });
      if (error) {
        throw makeApiError(error.message);
      }
      break;
    }
  }

  const response = makeApiSuccess({ detail: "E-mail sent!" });
  res.status(response.code).json(response);
});
