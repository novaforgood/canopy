import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "../components/atomic/Button";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

import type { NextPage } from "next";

function LandingPage() {
  const router = useRouter();
  return (
    <div className="w-full p-8 md:h-screen">
      <div className="w-full items-center justify-between md:flex">
        <img src="https://c.tenor.com/D6IwAVg5qM4AAAAM/forme.gif" />
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
                router.push("/jeff");
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
    <div className="p-4">
      <h1>Logged In Home Page</h1>
      <p>This is the logged in home page.</p>
      <div className="h-4"></div>
      <div className="border shadow-md p-2">
        <p>Current User: {userData?.email}</p>
        <p>User ID: {userData?.id}</p>
        <p>Email Verified: {auth.currentUser?.emailVerified ? "Yes" : "No"}</p>
      </div>

      <div className="h-4"></div>

      <div className="text-xl">Spaces:</div>
      <div className="h-4"></div>
      <div className="flex flex-col gap-2 items-start">
        {profileData?.profile.map((profile) => {
          return (
            <Button
              key={profile.id}
              className="p-2 border"
              onClick={() => {
                router.push(`/space/${profile.space.slug}`);
              }}
            >
              <span>
                Go to space: <b>{profile.space.name}</b>
              </span>
            </Button>
          );
        })}
        <Button
          onClick={() => {
            router.push("/create");
          }}
        >
          Create new space
        </Button>
      </div>
      <div className="h-16"></div>
      <Button onClick={logout}>Log out</Button>

      <div className="h-4"></div>
    </div>
  );
}

const Home: NextPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return <div>{isLoggedIn ? <LoggedInHomePage /> : <LandingPage />}</div>;
};

export default Home;
