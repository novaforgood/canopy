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
import { sendgridMail } from "../../../server/sendgrid";

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
  console.log("Sending email");
  switch (req.body.type) {
    case EmailType.Connect: {
      const {
        senderProfileId,
        receiverProfileId,
        introMessage,
        availability,
        timezone,
      } = req.body.payload;

      const [
        { data: senderData, error: senderError },
        { data: receiverData, error: receiverError },
      ] = await Promise.all([
        executeGetProfileQuery({ profile_id: senderProfileId }),
        executeGetProfileQuery({ profile_id: receiverProfileId }),
      ]);
      if (
        senderError ||
        receiverError ||
        !senderData?.profile_by_pk ||
        !receiverData?.profile_by_pk
      ) {
        throw makeApiFail(
          senderError?.message ??
            receiverError?.message ??
            "Sender or receiver not found"
        );
      }

      const sender = senderData.profile_by_pk.user;
      const receiver = receiverData.profile_by_pk.user;

      if (sender.email === receiver.email) {
        throw makeApiFail("Cannot connect to yourself");
      }

      await sendgridMail
        .send({
          from: "connect@joincanopy.org",
          cc: [sender.email],
          to: receiver.email,
          templateId: "d-511fd4076eaf47269c1f3f1783c449ad",
          dynamicTemplateData: {
            sender: {
              firstName: sender.first_name,
              lastName: sender.last_name,
            },
            receiver: {
              firstName: receiver.first_name,
              lastName: receiver.last_name,
            },
            introMessage,
            availability,
            timezone,
          },
        })
        .catch((err) => {
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
