import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

import { Button, Text } from "../components/atomic";
import { SidePadding } from "../components/SidePadding";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { BxExit } from "../generated/icons/regular";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";
import { CustomPage } from "../types";

import type { NextPage } from "next";

function LandingPage() {
  const router = useRouter();
  return (
    <div className="w-full p-8 md:h-screen">
      <div className="w-full items-center justify-between md:flex">
        <img src="https://c.tenor.com/D6IwAVg5qM4AAAAM/forme.gif" alt="pepe" />
        <div className="flex" justify-end="true">
          {
            <Button
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
              Sign up
            </Button>
          }
        </div>
      </div>
      <div className="flex justify-between gap-100 pt-10 md:px-36 md:pt-36">
        <div>
          Mentor Center makes mentorship accessible and manageable for any
          community. Only login button works for now.
          <Button
            className="h-14 px-4 md:w-80"
            onClick={() => {
              router.push("/jeff");
            }}
          >
            Join Beta
          </Button>
        </div>
      </div>
    </div>
  );
}

const logout = () => {
  signOut(auth);
};

function LoggedInHomePage() {
  const { userData } = useUserData();
  const [{ data: profileData }] = useAllProfilesOfUserQuery({
    variables: { user_id: userData?.id ?? "" },
  });
  const router = useRouter();
  return (
    <div>
      <SidePadding>
        <div className="flex flex-col items-center pt-12">
          <Text variant="heading4">Welcome to Canopy!</Text>

          <div className="h-12"></div>

          <div className="flex flex-col gap-8 items-start w-120">
            {profileData?.profile.map((profile) => {
              return (
                <div
                  className="flex justify-between items-center w-full"
                  key={profile.id}
                >
                  <Text variant="heading4">{profile.space.name}</Text>
                  <button
                    className="w-6 h-6 hover:text-gray-700"
                    onClick={() => {
                      router.push(`/space/${profile.space.slug}`);
                    }}
                  >
                    <BxExit />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="h-12"></div>
          <Button
            onClick={() => {
              router.push("/create");
            }}
          >
            Create new space
          </Button>
          <div className="h-16"></div>
          <Button onClick={logout} variant="outline">
            Log out
          </Button>

          <div className="h-4"></div>
        </div>
      </SidePadding>
    </div>
  );
}

const HomePage: CustomPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return <div>{isLoggedIn ? <LoggedInHomePage /> : <LandingPage />}</div>;
};

HomePage.requiresAuthentication = false;
export default HomePage;
