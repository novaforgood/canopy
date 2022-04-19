import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../../components/atomic/Button";
import { useSpaceBySlugQuery, useUserQuery } from "../../../generated/graphql";
import { useIsLoggedIn } from "../../../hooks/useIsLoggedIn";
import { useSignIn } from "../../../hooks/useSignIn";
import { useUserData } from "../../../hooks/useUserData";
import { auth } from "../../../lib/firebase";

export default function SpaceHomepage() {
  const router = useRouter();

  const [{ data: spaceData }] = useSpaceBySlugQuery({
    variables: { slug: router.query.slug as string },
  });
  const space = spaceData?.spaces[0];

  if (!space) {
    return <div>404 - Space not found</div>;
  }

  return (
    <div className="p-4">
      <div className="text-2xl">
        Welcome to <b>{space.name}</b>!
      </div>
      <div>There is nothing here lol</div>
      <Button
        onClick={() => {
          router.push("/");
        }}
      >
        Go back to home
      </Button>
    </div>
  );
}
