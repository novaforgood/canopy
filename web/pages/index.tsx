import { signOut } from "firebase/auth";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../components/atomic/Button";
import { useAllProfilesOfUserQuery } from "../generated/graphql";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

function LandingPage() {
  return (
    <div>
      <h1>Landing Page</h1>
      <p>This is the landing page.</p>
      <div className="flex flex-col">
        <Link href="/create">Create Program</Link>
        <Link href="/login">Login</Link>
        <Link href="/">Home</Link>
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
      <h1>Logged In Home Page</h1>
      <p>This is the logged in home page.</p>
      <div className="h-4"></div>
      <div className="border shadow-md p-2">
        <p>Current User: {userData?.email}</p>
        <p>User ID: {userData?.id}</p>
      </div>

      <div className="h-4"></div>

      <div className="text-xl">Spaces:</div>
      <div className="h-4"></div>
      <div className="flex flex-col gap-2 items-start">
        {profileData?.profiles.map((profile) => {
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
          Create new program
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
