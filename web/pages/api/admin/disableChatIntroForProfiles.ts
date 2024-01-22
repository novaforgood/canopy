import { z } from "zod";

import {
  executeGetProfileQuery,
  executeGetProfilesQuery,
  executeGetSpaceQuery,
  executeUpdateProfileMutation,
  executeUpdateProfilesMutation,
  executeUpdateSpaceMutation,
  Profile_Role_Enum,
} from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import {
  makeApiError,
  makeApiFail,
  makeApiSuccess,
} from "../../../server/response";

const requestSchema = z.object({
  profileIds: z.array(z.string()),
});

/**
 * Transfer [spaceId] ownership to [toUserId]
 */
export default applyMiddleware({
  authenticated: true,
  authorizationsInSpace: [Profile_Role_Enum.Admin],
  validationSchema: requestSchema,
}).post(async (req, res) => {
  const { profileIds } = req.body;

  const { data: profileData, error } = await executeGetProfilesQuery({
    where: {
      id: {
        _in: profileIds,
      },
    },
  });

  if (error) {
    throw makeApiFail(error.message);
  }
  const profiles = profileData?.profile;
  if (!profiles) {
    throw makeApiFail("No profile found to transfer ownership to");
  }

  if (profiles.some((profile) => !profile.attributes?.enableChatIntros)) {
    throw makeApiFail("Some profiles already have chat intros disabled");
  }
  const spaceId = req.callerProfile?.space?.id;
  if (profiles.some((profile) => profile.space.id !== spaceId)) {
    throw makeApiFail("Some profiles are not in the same space as the admin");
  }

  const { error: spaceError } = await executeUpdateProfilesMutation({
    where: {
      id: {
        _in: profileIds,
      },
    },
    changes: {
      attributes: {
        _append: {
          enableChatIntros: false,
        },
      },
    },
  });
  if (spaceError) {
    throw makeApiFail(spaceError.message);
  }

  const response = makeApiSuccess({
    detail: "Success",
  });
  res.status(response.code).json(response);
});
