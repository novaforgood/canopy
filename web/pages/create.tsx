import React, { useEffect, useState } from "react";
import { customAlphabet } from "nanoid";
import { Button } from "../components/atomic/Button";
import { Input } from "../components/atomic/Input";
import { useCreateOwnerProfileInNewSpaceMutation } from "../generated/graphql";
import { useUserData } from "../hooks/useUserData";
import { auth } from "../lib/firebase";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function slugifyAndAppendRandomString(name: string) {
  return `${slugify(name)}-${nanoid()}`;
}

export default function CreatePage() {
  const [res, createOwnerProfile] = useCreateOwnerProfileInNewSpaceMutation();

  const { userData } = useUserData();
  const [name, setName] = useState("");

  return (
    <div>
      <div>Create a space!</div>
      <Input value={name} onValueChange={setName} placeholder="Name" />
      <Button
        onClick={() => {
          createOwnerProfile({
            space: {
              name,
              owner_id: userData?.id,
              slug: slugifyAndAppendRandomString(name),
            },
            user_id: userData?.id ?? "",
          });
        }}
      >
        Create
      </Button>
    </div>
  );
}
