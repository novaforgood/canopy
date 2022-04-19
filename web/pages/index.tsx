import type { NextPage } from "next";
import Link from "next/link";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";

const Home: NextPage = () => {
  const isLoggedIn = useIsLoggedIn();
  return (
    <div className="bg-blue-50">
      <Link href="/login">Login</Link>
    </div>
  );
};

export default Home;
