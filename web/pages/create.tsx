import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCreateSpaceMutation } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

export default function CreatePage() {
  const [createSpace] = useCreateSpaceMutation();
  //   const { userData } = useUserData();

  //   console.log(userData);
  console.log("Load");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div>
      {/* <div>Welcome {userData?.id}</div> */}
      <div>Create a space!</div>
      <input value={name} />
      <input value={slug} />
    </div>
  );
}
