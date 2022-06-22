import { useRouter } from "next/router";

import { Button, Text } from "../components/atomic";
import { SidePadding } from "../components/SidePadding";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxExit } from "../generated/icons/regular";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { signOut } from "../lib/firebase";
import { CustomPage } from "../types";

function LandingPage() {
  const router = useRouter();
  return (
    <div className="w-full px-6 py-4 sm:py-16 sm:px-32 md:h-screen">
      <div className="flex flex-col sm:flex-row gap-4 items-start w-full sm:items-center justify-between">
        <img src={"/assets/canopyLogo.svg"} alt="Canopy Logo" />
        <div className="flex">
          {
            <Button
              variant="outline"
              onClick={() => {
                router.push("/login");
              }}
            >
              Login
            </Button>
          }
          <div className="w-4" />
          {
            <Button
              onClick={() => {
                router.push("/signup");
              }}
            >
              Sign up to connect
            </Button>
          }
        </div>
      </div>
      <div className="flex flex-col justify-start items-start pt-24 sm:pt-40 max-w-xl">
        <Text variant="heading1" mobileVariant="heading3">
          Helping communities grow tight-knit support networks
        </Text>
        <div className="h-8"></div>
        <Text>
          Whether you’re running a mentorship program or simply helping your
          friends stay connected, Canopy helps you create and customize your own
          community directory.
        </Text>
        <div className="h-16"></div>
        <Button
          rounded
          onClick={() => {
            router.push("/signup");
          }}
        >
          Get started
        </Button>
      </div>
    </div>
  );
}

function LoggedInHomePage() {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });
  const router = useRouter();
  return (
    <SidePadding>
      <div className="flex flex-col items-center pt-12">
        <Text variant="heading4">Welcome to Canopy!</Text>

        <div className="h-12"></div>

        <div className="flex flex-col gap-4 items-start w-full sm:w-120">
          {profileData?.profile.map((profile) => {
            return (
              <button
                className="border p-2 flex justify-between items-center w-full"
                key={profile.id}
                onClick={() => {
                  router.push(`/space/${profile.space.slug}`);
                }}
              >
                <Text variant="heading4" mobileVariant="subheading2">
                  {profile.space.name}
                </Text>
                <BxExit className="w-6 h-6 hover:text-gray-700" />
              </button>
            );
          })}
        </div>
        <div className="h-12"></div>
        <Button
          onClick={() => {
            router.push("/create");
          }}
        >
          Create new directory
        </Button>
        <div className="h-8 sm:h-16"></div>
        <Button onClick={signOut} variant="outline">
          Log out
        </Button>

        <div className="h-4"></div>
      </div>
    </SidePadding>
  );
}

const HomePage: CustomPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return <div>{isLoggedIn ? <LoggedInHomePage /> : <LandingPage />}</div>;
};

HomePage.requiredAuthorizations = [];

export default HomePage;
