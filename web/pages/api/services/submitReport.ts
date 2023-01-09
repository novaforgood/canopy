import { z } from "zod";

import { requireServerEnv } from "../../../server/env";
import {
  executeGetProfilesQuery,
  executeInsertReportMutation,
  Profile_Role_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const HOST_URL = requireServerEnv("HOST_URL");

const submitReportSchema = z.object({
  subjectProfileId: z.string(),
  body: z.string(),
  imageIds: z.array(z.string()).min(0).max(5).optional(),
  anonymous: z.boolean().optional(),
});

enum ChatBotIds {
  CanopyBot = "bot-BAZe9r-canopybot",
}

/**
 * Given an invite link ID
 */
export default applyMiddleware({
  authenticated: true,
  validationSchema: submitReportSchema,
}).post(async (req, res) => {
  const { subjectProfileId, body, imageIds, anonymous } = req.body;

  const spaceId =
    req.token["https://hasura.io/jwt/claims"]?.["x-hasura-space-id"];
  if (!spaceId) {
    throw makeApiFail("No space ID found in token");
  }

  // Verify that the user is a member of the space.
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
  if (!roles.includes(Profile_Role_Enum.Member)) {
    throw makeApiFail("Only members of this space can report.");
  }

  // Create report
  const { data: reportData, error: insertReportError } =
    await executeInsertReportMutation({
      data: {
        subject_profile_id: subjectProfileId,
        reporter_profile_id: anonymous ? null : callerProfile.id,
        body: body,
        report_to_images: {
          data: imageIds?.map((image) => ({ image_id: image })) ?? [],
        },
      },
    });
  if (insertReportError) {
    throw makeApiError(insertReportError.message);
  }
  if (!reportData?.insert_report_one?.id) {
    throw makeApiError("Report not created");
  }

  const response = makeApiSuccess({
    detail: "Success",
    reportId: reportData.insert_report_one.id,
  });
  res.status(response.code).json(response);
});
