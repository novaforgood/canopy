import { useRouter } from "next/router";

import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxExit, BxGroup, BxPlus } from "../generated/icons/regular";
import { BxsGroup } from "../generated/icons/solid";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";

import { Button, Text } from "./atomic";
import { SidePadding } from "./layout/SidePadding";
import { Navbar } from "./navbar/Navbar";
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
        <div className="flex flex-col-reverse items-start gap-8 md:flex-row">
          <div className="grid-rows grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
            {profileData?.profile.map((profile) => {
              return (
                <div key={profile.id} className="">
                  <button
                    className="w-full overflow-hidden rounded-md border border-gray-400 shadow-sm transition hover:border-green-500"
                    onClick={() => {
                      router.push(`/space/${profile.space.slug}`);
                    }}
                  >
                    <SpaceCoverPhoto
                      className="w-full"
                      src={profile.space.space_cover_image?.image.url ?? null}
                      alt=""
                    />
                    <div className="flex items-center gap-2 bg-white p-2">
                      <BxsGroup className="h-6 w-6 shrink-0" />
                      <Text
                        variant="subheading1"
                        mobileVariant="subheading2"
                        className="truncate"
                      >
                        {profile.space.name}
                      </Text>
                    </div>
                  </button>
                </div>
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
            <BxPlus className="mr-1 h-5 w-5" />
            Create new directory
          </Button>
        </div>
        <div className="h-16"></div>
      </SidePadding>
    </>
  );
}
