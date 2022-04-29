import { auth } from "firebase-admin";
import { getAuth } from "firebase/auth";
import { gql } from "urql";
import { serverUrqlClient } from "../../../server/urql";
import { withAuth } from "../../../server/withAuth";

const UPSERT_USER_MUTATION = gql`
  mutation UpsertUser(
    $id: String!
    $email: String!
    $first_name: String!
    $last_name: String!
  ) {
    insert_users_one(
      object: {
        id: $id
        email: $email
        first_name: $first_name
        last_name: $last_name
      }
      on_conflict: {
        constraint: users_pkey
        update_columns: [email, first_name, last_name]
      }
    ) {
      email
      id
      first_name
      last_name
    }
  }
`;

type ResponseData = {
  detail: string;
};

export default withAuth<ResponseData>(async (req, res) => {
  console.log(req.token);
  auth()
    .getUser(req.token.uid)
    .then(async (user) => {
      await serverUrqlClient
        .mutation(UPSERT_USER_MUTATION, {
          id: user.uid,
          email: user.email,
          first_name: user.displayName?.split(" ")[0],
          last_name: user.displayName?.split(" ")[1],
        })
        .toPromise()
        .catch((e) => {
          console.log(e);
        });
    });

  res.status(200).json({ detail: "Successful" });
});
