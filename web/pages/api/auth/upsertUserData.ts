import { gql } from "urql";
import { serverUrqlClient } from "../../../server/urql";
import { withAuth } from "../../../server/withAuth";

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

type ResponseData = {
  detail: string;
};

export default withAuth<ResponseData>(async (req, res) => {
  await serverUrqlClient
    .mutation(UPSERT_USER_MUTATION, {
      id: req.token.uid,
      email: req.token.email,
    })
    .toPromise()
    .catch((e) => {
      console.log(e);
    });
  res.status(200).json({ detail: "Successful" });
});
