import { useCallback } from "react";

import { useAtom } from "jotai";
import Link from "next/link";
import router, { useRouter } from "next/router";

import { Button, Text } from "../components/atomic";
import { SpaceCoverPhoto } from "../components/common/SpaceCoverPhoto";
import { SidePadding } from "../components/layout/SidePadding";
import { Navbar } from "../components/navbar/Navbar";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { CustomPage } from "../types";

const DebugPage: CustomPage = () => {
  const router = useRouter();
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });

  return (
    <div className="bg-gray-50">
      <Navbar />
      <SidePadding className="min-h-screen">
        <div className="h-16"></div>
        <button
          className="hover:underline"
          onClick={() => {
            router.back();
          }}
        >
          <Text>{"< Back"}</Text>
        </button>
        <div className="h-8"></div>
        <Text>
          Before you delete your account, you must first leave all of your
          directories. If you are a directory owner, you must first transfer
          ownership to another user or delete the directory.
        </Text>
        <div className="h-4"></div>
        <Text variant="subheading1">Directories to leave:</Text>
        <div className="grid gap-4 lg:grid-cols-2">
          {profileData?.profile.map((profile) => {
            const isOwner = profile.space.owner_id === userData?.id;
            return (
              <div className="flex shadow-md" key={profile.id}>
                {/* <SpaceCoverPhoto
                  src={profile.space.space_cover_image?.image.url}
                  className="h-14"
                /> */}
                <div className="flex grow items-center justify-between p-2">
                  <div className="flex flex-col">
                    <Text>{profile.space.name}</Text>
                    <Text className="text-gray-500" variant="body2">
                      {isOwner ? "Owner" : "Member"}
                    </Text>
                  </div>
                  {isOwner ? (
                    <Link href={`/space/${profile.space.slug}/admin`}>
                      <a>
                        <Text
                          variant="body2"
                          className="text-gray-700 hover:underline"
                        >
                          Transfer ownership or delete
                        </Text>
                      </a>
                    </Link>
                  ) : (
                    <Link
                      href={`/space/${profile.space.slug}/account/settings`}
                    >
                      <a>
                        <Text
                          variant="body2"
                          className="text-gray-700 hover:underline"
                        >
                          Leave directory
                        </Text>
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-16"></div>
        <Button
          onClick={() => {
            router.push("/delete-account");
          }}
        >
          Delete Account
        </Button>
        <div className="h-32"></div>
      </SidePadding>
    </div>
  );
};

DebugPage.showFooter = false;

export default DebugPage;
