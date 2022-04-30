import { gql } from "urql";
import { executeUpsertUserMutation } from "../../../server/generated/serverGraphql";
import { applyMiddleware } from "../../../server/middleware";
import { makeApiSuccess } from "../../../server/response";

const UPSERT_USER_MUTATION = gql`
  mutation UpsertUser($id: String!, $email: String!) {
    insert_users_one(
      object: { id: $id, email: $email }
      on_conflict: { constraint: users_pkey, update_columns: [email] }
    ) {
      email
      id
    }
  }
`;

export default applyMiddleware({
  authenticated: true,
}).get(async (req, res) => {
  await executeUpsertUserMutation({
    id: req.token.uid,
    email: req.token.email ?? "",
  });

  const response = makeApiSuccess({ detail: "Successful" });
  res.status(response.code).json(response);
});
