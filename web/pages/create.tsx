import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { useCreateSpaceMutation } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

export default function CreatePage() {
  const [res, createSpace] = useCreateSpaceMutation();

  const { userData } = useUserData();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  console.log(name, slug);

  return (
    <div>
      <div>Create a space!</div>
      <Input value={name} onValueChange={setName} placeholder="Name" />
      <Input value={slug} onValueChange={setSlug} placeholder="Slug" />
      <Button
        onClick={() => {
          createSpace({
            space_name: name,
            slug: slug,
            user_id: userData?.id ?? "",
          });
        }}
      >
        Create
      </Button>
    </div>
  );
}
