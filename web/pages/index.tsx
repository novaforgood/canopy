import { ReactNode } from "react";

import { useRouter } from "next/router";

import { Button, Text } from "../components/atomic";
import { ConnectAnyone } from "../components/landing-page/ConnectAnyone";
import { HowItWorks } from "../components/landing-page/HowItWorks";
import { LandingSection } from "../components/landing-page/LandingSection";
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
    <div>
      <div className="bg-gray-100">
        <SidePadding className="w-full px-6 pt-4 sm:pt-16 sm:px-32">
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
          <div className="grid grid-cols-2 gap-16 items-end w-full">
            <div className="flex flex-col justify-start items-start pt-24 sm:pt-32">
              <Text variant="heading2" mobileVariant="heading3">
                Create a support structure for your community
              </Text>
              <div className="h-8"></div>
              <Text>
                Whether you’re running a mentorship program, professional
                network, or student organization, Canopy helps you create a
                customized directory that enables meaningful connection.
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
              <div className="h-32"></div>
            </div>
            <img
              className="object-contain"
              src="/assets/landing/trees_with_people.png"
              alt="Trees with faces"
            />
          </div>
        </SidePadding>
      </div>

      <LandingSection
        className="bg-olive-100"
        title="Empower your community members to start meaningful relationships"
        subtitle="Through a simple profile directory, Canopy helps people in your community easily find and reach out to each other."
      ></LandingSection>

      <LandingSection
        className="bg-gray-100"
        title="Connect anyone in any community"
        subtitle="Explore some of the ways Canopy can help you."
      >
        <div className="h-16"></div>
        <ConnectAnyone />
      </LandingSection>

      <LandingSection title="Simple. Friendly. Free."></LandingSection>
      <LandingSection title="How it works" className="bg-lime-200">
        <div className="h-16"></div>
        <HowItWorks />
      </LandingSection>

      <LandingSection className="bg-lime-400">
        <Text variant="heading4">Ready to get started?</Text>
        <div className="h-4"></div>
        <Button
          rounded
          onClick={() => {
            router.push("/create");
          }}
        >
          {"Let's Go"}
        </Button>
      </LandingSection>
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
    <SidePadding className="min-h-screen">
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
