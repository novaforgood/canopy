import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <Link href="/login">Login</Link>
    </div>
  );
};

export default Home;
