import { useRouter } from "next/router";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxExit, BxGroup, BxPlus } from "../generated/icons/regular";
import { BxsGroup } from "../generated/icons/solid";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";

import { Button, Text } from "./atomic";
import { SidePadding } from "./layout/SidePadding";
import { Navbar } from "./Navbar";
import { SpaceCoverPhoto } from "./SpaceCoverPhoto";

export function LoggedInHomePage() {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });
  const router = useRouter();
  return (
    <>
      <div className="bg-gray-50">
        <Navbar />
      </div>
      <SidePadding className="min-h-screen bg-gray-50">
        <div className="h-16"></div>
        <Text variant="heading3" mobileVariant="heading4">
          Your Canopy Directories
        </Text>
        <div className="h-8"></div>
        <div className="flex flex-col-reverse md:flex-row items-start gap-8">
          <div className="grid grid-rows sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start w-full flex-1">
            {profileData?.profile.map((profile) => {
              return (
                <button
                  className="border rounded-md shadow-sm border-gray-400 hover:border-green-500 overflow-hidden transition"
                  key={profile.id}
                  onClick={() => {
                    router.push(`/space/${profile.space.slug}`);
                  }}
                >
                  <SpaceCoverPhoto
                    className="w-full"
                    src={profile.space.space_cover_image?.image.url ?? null}
                    alt=""
                  />
                  <div className="flex bg-white p-2 gap-2 items-center">
                    <BxsGroup className="w-6 h-6 shrink-0" />
                    <Text
                      variant="subheading1"
                      mobileVariant="subheading2"
                      className="truncate"
                    >
                      {profile.space.name}
                    </Text>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            variant="cta"
            onClick={() => {
              router.push("/create");
            }}
            className="flex items-center"
          >
            <BxPlus className="h-5 w-5 mr-1" />
            Create new directory
          </Button>
        </div>
      </SidePadding>
    </>
  );
}
